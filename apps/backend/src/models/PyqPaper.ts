import { Schema, model, type InferSchemaType } from 'mongoose'

const pyqPaperSchema = new Schema(
  {
    year: { type: Number, required: true, index: true },
    title: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    subject: { type: String, required: true, enum: ['physics'], index: true },
  },
  { timestamps: true },
)

export type PyqPaperDoc = InferSchemaType<typeof pyqPaperSchema> & { _id: string }
export const PyqPaper = model('PyqPaper', pyqPaperSchema)
