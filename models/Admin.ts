import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'admins' }
);

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);
