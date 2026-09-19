import { GoogleGenAI, Type } from '@google/genai'
import { env } from '../config/env.js'
import { AppError } from '../utils/AppError.js'

export type TopicDescriptionInput = {
  subject: string
  chapter: string
  topic: string
  rawNotes: string
}

export type TopicDescription = {
  shortDescription: string
  longDescription: string
  keyPoints: string[]
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    shortDescription: { type: Type.STRING },
    longDescription: { type: Type.STRING },
    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['shortDescription', 'longDescription', 'keyPoints'],
}

  function isRetryableGeminiError(error: unknown) {
    const status = typeof error === 'object' && error !== null && 'status' in error ? error.status : undefined
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504
  }

  const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds))

export async function generateTopicDescription(input: TopicDescriptionInput): Promise<TopicDescription> {
  if (!env.GEMINI_API_KEY) {
    throw new AppError('AI_NOT_CONFIGURED', 503, 'AI generation is not configured')
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY })
  try {
    let response
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        response = await ai.models.generateContent({
          model: env.GEMINI_MODEL,
          contents: `You create draft academic topic descriptions for NEET UG students.
Use the raw notes as the primary and authoritative source. Do not add syllabus facts,
examples, claims, or terminology that are not supported by the notes. If the notes are
insufficient, state only what they support. Preserve scientific terminology and keep
the writing clear and student-friendly.

Subject: ${input.subject}
Chapter: ${input.chapter}
Topic: ${input.topic}
Raw notes:
${input.rawNotes}`,
          config: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema,
          },
        })
        break
      } catch (error) {
        if (!isRetryableGeminiError(error) || attempt === 1) throw error
        await delay(500)
      }
    }

    const candidateText =
      typeof response?.text === 'string' && response.text
        ? response.text
        : response?.candidates?.[0]?.content?.parts
          ?.map((part: { text?: string }) => part?.text ?? '')
          .join('')
          ?? ''

    const parsed = JSON.parse(candidateText || '{}') as Partial<TopicDescription>
    if (
      typeof parsed.shortDescription !== 'string' ||
      typeof parsed.longDescription !== 'string' ||
      !Array.isArray(parsed.keyPoints) ||
      parsed.keyPoints.some((point) => typeof point !== 'string')
    ) {
      throw new Error('Gemini returned an invalid topic description')
    }
    return parsed as TopicDescription
  } catch (error) {
    if (error instanceof AppError) throw error
    const providerMessage = error instanceof Error ? error.message : String(error)
    console.error(`Gemini topic generation failed: ${providerMessage}`)
    throw new AppError('AI_GENERATION_FAILED', 502, 'AI generation failed. Please try again later.')
  }
}