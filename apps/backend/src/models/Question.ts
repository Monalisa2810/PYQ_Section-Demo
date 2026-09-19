import { Schema, model, type InferSchemaType } from 'mongoose'

const questionSchema = new Schema(
  {
    paperId: { type: Schema.Types.ObjectId, ref: 'PyqPaper', required: true, index: true },
    subject: { type: String, required: true, enum: ['physics'] },
    chapter: { type: String, required: true, trim: true, index: true },
    text: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length === 4,
        message: 'A question must have exactly 4 options',
      },
    },
    correctOptionIndex: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, required: true },
  },
  { timestamps: true },
)

export type QuestionDoc = InferSchemaType<typeof questionSchema> & { _id: string }
export const Question = model('Question', questionSchema)
