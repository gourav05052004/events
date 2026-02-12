import mongoose, { Schema, Document } from 'mongoose';

export type ResourceType = 'HALL' | 'ROOM' | 'LAB';
export type AvailabilityStatus = 'available' | 'partially_booked' | 'full_booked';

export interface IResource extends Document {
  name: string;
  type: ResourceType;
  location: string;
  capacity: number;
  amenities: string[];
  manager: string;
  contact: string;
  booked_events: number;
  manual_status?: AvailabilityStatus;
  created_at: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['HALL', 'ROOM', 'LAB'], required: true },
    location: { type: String, required: true },
    capacity: { type: Number, required: true },
    amenities: { type: [String], default: [] },
    manager: { type: String, required: true },
    contact: { type: String, required: true },
    booked_events: { type: Number, default: 0 },
    manual_status: { type: String, enum: ['available', 'partially_booked', 'full_booked'], default: null },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'resources' }
);

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', resourceSchema);
