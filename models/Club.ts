import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  club_name: string;
  email: string;
  password_hash: string;
  faculty_coordinator_name: string;
  faculty_coordinator_email?: string;
  faculty_coordinator_phone?: string;
  faculty_coordinator_department?: string;
  faculty_coordinator_office?: string;
  faculty_coordinator_image?: string;
  president_name?: string;
  president_email?: string;
  president_phone?: string;
  president_department?: string;
  president_office?: string;
  president_image?: string;
  description: string;
  logo?: string;
  brand_color?: string;
  is_active: boolean;
  created_at: Date;
}

const clubSchema = new Schema<IClub>(
  {
    club_name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    faculty_coordinator_name: { type: String, required: true },
    faculty_coordinator_email: { type: String, default: '' },
    faculty_coordinator_phone: { type: String, default: '' },
    faculty_coordinator_department: { type: String, default: '' },
    faculty_coordinator_office: { type: String, default: '' },
    faculty_coordinator_image: { type: String, default: '' },
    president_name: { type: String, default: '' },
    president_email: { type: String, default: '' },
    president_phone: { type: String, default: '' },
    president_department: { type: String, default: '' },
    president_office: { type: String, default: '' },
    president_image: { type: String, default: '' },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    brand_color: { type: String, default: '#8B1E26' },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'clubs' }
);

export default mongoose.models.Club || mongoose.model<IClub>('Club', clubSchema);
