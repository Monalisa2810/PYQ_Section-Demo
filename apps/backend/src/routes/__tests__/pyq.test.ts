import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { buildApp } from '../../app.js'
import { PyqPaper } from '../../models/PyqPaper.js'
import { Question } from '../../models/Question.js'

let mongoServer: MongoMemoryServer
const app = buildApp()

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe('PYQ Routes', () => {
  let testPaperId: string

  beforeAll(async () => {
    // Seed test data
    const paper = await PyqPaper.create({
      year: 2024,
      title: 'NEET UG 2024',
      code: 'T3',
      subject: 'physics',
    })
    testPaperId = paper._id.toString()

    await Question.create({
      paperId: paper._id,
      subject: 'physics',
      chapter: 'Test Chapter',
      text: 'What is the speed of light?',
      options: ['3e8 m/s', '3e5 m/s', '3e10 m/s', '3e2 m/s'],
      correctOptionIndex: 0,
      explanation: 'Constant c is 3e8 m/s',
    })
  })

  it('GET /api/pyq/papers should return all papers', async () => {
    const res = await request(app).get('/api/pyq/papers').expect(200)
    
    expect(res.body.data).toBeDefined()
    expect(res.body.data.papers).toHaveLength(1)
    expect(res.body.data.papers[0].title).toBe('NEET UG 2024')
  })

  it('GET /api/pyq/papers/:id/questions should return questions without protected fields', async () => {
    const res = await request(app)
      .get(`/api/pyq/papers/${testPaperId}/questions`)
      .expect(200)

    expect(res.body.data).toBeDefined()
    expect(res.body.data.paper.code).toBe('T3')
    
    const questions = res.body.data.questions
    expect(questions).toHaveLength(1)
    expect(questions[0].text).toBe('What is the speed of light?')
    
    // Ensure protected fields are NOT present
    expect(questions[0].correctOptionIndex).toBeUndefined()
    expect(questions[0].explanation).toBeUndefined()
  })

  it('GET /api/pyq/papers/:id/questions should return 400 for invalid ID', async () => {
    const res = await request(app).get('/api/pyq/papers/invalid123/questions').expect(400)
    expect(res.body.error.code).toBe('INVALID_ID')
  })

  it('GET /api/pyq/papers/:id/questions should return 404 for non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId()
    const res = await request(app).get(`/api/pyq/papers/${fakeId}/questions`).expect(404)
    expect(res.body.error.code).toBe('NOT_FOUND')
  })
})
