import { Router } from 'express'
import mongoose from 'mongoose'
import { z } from 'zod'
import { Topic } from '../models/Topic.js'
import { generateTopicDescription } from '../services/topicDescription.js'

const topicInputSchema = z.object({
  subject: z.string().trim().min(1).max(100),
  chapter: z.string().trim().min(1).max(150),
  topic: z.string().trim().min(1).max(150),
  rawNotes: z.string().trim().min(20).max(20_000),
})

const topicDraftSchema = topicInputSchema.extend({
  shortDescription: z.string().trim().min(1),
  longDescription: z.string().trim().min(1),
  keyPoints: z.array(z.string().trim().min(1)).min(1).max(20),
})

export const adminRouter = Router()

adminRouter.post('/topics/generate-description', async (req, res, next) => {
  try {
    const input = topicInputSchema.parse(req.body)
    const description = await generateTopicDescription(input)
    res.json({ data: description })
  } catch (error) {
    next(error)
  }
})

adminRouter.post('/topics', async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'Database is unavailable; draft was not saved' } })
      return
    }
    const draft = topicDraftSchema.parse(req.body)
    const topic = await Topic.create({ ...draft, status: 'draft', generatedByAi: true })
    res.status(201).json({ data: topic.toObject() })
  } catch (error) {
    next(error)
  }
})

adminRouter.patch('/topics/:id/approve', async (req, res, next) => {
  try {
    const topic = await Topic.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true })
    if (!topic) {
      res.status(404).json({ error: { code: 'TOPIC_NOT_FOUND', message: 'Topic not found' } })
      return
    }
    res.json({ data: topic.toObject() })
  } catch (error) {
    next(error)
  }
})