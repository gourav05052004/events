import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  club_name: string;
  email: string;
  password_hash: string;
  faculty_coordinator_name: string;
  description: string;
  is_active: boolean;
  created_at: Date;
}

const clubSchema = new Schema<IClub>(
  {
    club_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    faculty_coordinator_name: { type: String, required: true },
    description: { type: String, default: '' },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'clubs' }
);

export default mongoose.models.Club || mongoose.model<IClub>('Club', clubSchema);
