import { Schema, model, models, Document, Types, Model } from 'mongoose'

// TS interface for the raw MongoDB document
export interface ICategory {
  _id: Types.ObjectId
  name: string
  createdAt: Date
  updatedAt: Date
}

// Mongoose Document interface extends Document and binds the schema shape
export interface ICategoryDocument extends Document<Types.ObjectId> {
  name: string
}

// Define the schema, with timestamps for createdAt/updatedAt
const CategorySchema = new Schema<ICategoryDocument>(
  {
    name: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
)

// Use existing model if available, otherwise compile a new one
// Cast models.Category to Model<ICategoryDocument> to match typing
const Category = (models.Category as Model<ICategoryDocument>) || model<ICategoryDocument>('Category', CategorySchema)

export default Category
