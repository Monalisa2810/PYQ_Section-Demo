import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { buildApp } from '../src/app.js'

describe('POST /api/admin/topics/generate-description', () => {
  it('rejects missing required topic information', async () => {
    const res = await request(buildApp()).post('/api/admin/topics/generate-description').send({ subject: 'Biology' })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })

  it('rejects notes that are too short to ground a draft', async () => {
    const res = await request(buildApp()).post('/api/admin/topics/generate-description').send({
      subject: 'Biology', chapter: 'Human Physiology', topic: 'Mechanism of inspiration', rawNotes: 'short',
    })
    expect(res.status).toBe(400)
    expect(res.body.error.code).toBe('VALIDATION_ERROR')
  })
})