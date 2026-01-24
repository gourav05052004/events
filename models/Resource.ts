import mongoose, { Schema, Document } from 'mongoose';

export type ResourceType = 'HALL' | 'ROOM' | 'LAB';

export interface IResource extends Document {
  name: string;
  type: ResourceType;
  capacity: number;
  created_at: Date;
}

const resourceSchema = new Schema<IResource>(
  {
    name: { type: String, required: true },
    type: { type: String, enum: ['HALL', 'ROOM', 'LAB'], required: true },
    capacity: { type: Number, required: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'resources' }
);

export default mongoose.models.Resource || mongoose.model<IResource>('Resource', resourceSchema);
