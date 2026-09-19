import { describe, it, expect, vi } from 'vitest'

const generateContent = vi.fn().mockResolvedValue({
  text: JSON.stringify({
    shortDescription: 'The diaphragm contracts and moves downward during inspiration.',
    longDescription: 'During inspiration, contraction of the diaphragm increases the volume of the thoracic cavity and draws air into the lungs.',
    keyPoints: ['Diaphragm contracts', 'Thoracic cavity volume increases', 'Air moves into the lungs'],
  }),
})

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    models = { generateContent }
  },
  Type: { OBJECT: 'OBJECT', STRING: 'STRING', ARRAY: 'ARRAY' },
}))

describe('generateTopicDescription', () => {
  it('returns structured Biology content from the Gemini response', async () => {
    process.env.GEMINI_API_KEY = 'test-key'
    const { generateTopicDescription } = await import('../src/services/topicDescription.js')
    const result = await generateTopicDescription({
      subject: 'Biology',
      chapter: 'Human Physiology',
      topic: 'Mechanism of inspiration',
      rawNotes: 'The diaphragm contracts and moves downward. Thoracic volume increases and air enters the lungs.',
    })

    expect(result.shortDescription).toContain('diaphragm')
    expect(result.longDescription).toBeTypeOf('string')
    expect(result.keyPoints).toEqual(expect.arrayContaining(['Diaphragm contracts']))
    expect(generateContent).toHaveBeenCalledOnce()
  })

  it('parses the JSON from Gemini candidates when response.text is absent', async () => {
    generateContent.mockResolvedValueOnce({
      candidates: [
        {
          content: {
            parts: [
              {
                text: JSON.stringify({
                  shortDescription: 'The diaphragm contracts during inspiration.',
                  longDescription: 'The diaphragm contracts and increases thoracic volume so air moves into the lungs.',
                  keyPoints: ['Diaphragm contracts', 'Thoracic volume rises', 'Air enters lungs'],
                }),
              },
            ],
          },
        },
      ],
    })

    const { generateTopicDescription } = await import('../src/services/topicDescription.js')
    const result = await generateTopicDescription({
      subject: 'Biology',
      chapter: 'Respiration',
      topic: 'Inspiration',
      rawNotes: 'The diaphragm contracts. Thoracic volume increases. Air enters the lungs.',
    })

    expect(result.shortDescription).toContain('diaphragm')
    expect(result.longDescription).toContain('thoracic volume')
    expect(result.keyPoints).toHaveLength(3)
  })
})