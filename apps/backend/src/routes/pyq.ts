import { Router } from 'express'
import { z } from 'zod'
import { PyqPaper } from '../models/PyqPaper.js'
import { Question } from '../models/Question.js'
import { AppError } from '../utils/AppError.js'
import mongoose from 'mongoose'

export const pyqRouter = Router()

// GET /api/pyq/papers
// Returns a list of all available PYQ papers
pyqRouter.get('/papers', async (req, res, next) => {
  try {
    const papers = await PyqPaper.find().sort({ year: -1 }).lean()
    
    res.json({
      data: {
        papers,
      },
    })
  } catch (error) {
    next(error)
  }
})

// GET /api/pyq/papers/:id/questions
// Returns questions for a specific paper, stripping out protected fields
pyqRouter.get('/papers/:id/questions', async (req, res, next) => {
  try {
    const paperId = req.params.id

    if (!mongoose.Types.ObjectId.isValid(paperId)) {
      throw new AppError(400, 'INVALID_ID', 'Invalid paper ID format')
    }

    const paper = await PyqPaper.findById(paperId).lean()
    if (!paper) {
      throw new AppError(404, 'NOT_FOUND', 'Paper not found')
    }

    // Fetch questions without 'correctOptionIndex' and 'explanation'
    const questions = await Question.find({ paperId: paper._id })
      .select('-correctOptionIndex -explanation')
      .lean()

    res.json({
      data: {
        paper,
        questions,
      },
    })
  } catch (error) {
    next(error)
  }
})
