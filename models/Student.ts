import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  password_hash: string;
  roll_number: string;
  department: string;
  batch: string;
  avatar?: string;
  created_at: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    roll_number: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    batch: { type: String, required: true },
    avatar: { type: String, default: null },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'students' }
);

export default mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);
