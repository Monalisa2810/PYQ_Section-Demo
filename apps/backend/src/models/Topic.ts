import { Schema, model, type InferSchemaType } from 'mongoose'

const topicSchema = new Schema(
  {
    subject: { type: String, required: true, trim: true },
    chapter: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    rawNotes: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true },
    longDescription: { type: String, required: true, trim: true },
    keyPoints: { type: [String], required: true },
    status: { type: String, enum: ['draft', 'approved'], default: 'draft', index: true },
    generatedByAi: { type: Boolean, default: true },
  },
  { timestamps: true },
)

export type TopicDoc = InferSchemaType<typeof topicSchema> & { _id: string }
export const Topic = model('Topic', topicSchema)