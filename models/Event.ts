import mongoose, { Schema, Document } from 'mongoose';

export type EventType = 'INDIVIDUAL' | 'TEAM';
export type EventStatus = 'PENDING' | 'APPROVED' | 'RESCHEDULED' | 'CANCELLED';
export type ResourceType = 'HALL' | 'ROOM' | 'LAB';

export interface IEvent extends Document {
  primary_club_id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  event_type: EventType;
  poster_url: string;
  location?: string;
  requested_resource_type: ResourceType;
  allocated_resource_id: mongoose.Types.ObjectId | null;
  date: Date;
  end_date: Date;
  start_time: string;
  end_time: string;
  min_participants: number;
  max_participants: number;
  min_team_members?: number;
  max_team_members?: number;
  categories?: string[];
  registration_deadline: Date;
  status: EventStatus;
  created_at: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    primary_club_id: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    event_type: { type: String, enum: ['INDIVIDUAL', 'TEAM'], required: true },
    poster_url: { type: String, default: '' },
    location: { type: String, default: '' },
    requested_resource_type: { type: String, enum: ['HALL', 'ROOM', 'LAB'], required: true },
    allocated_resource_id: { type: Schema.Types.ObjectId, ref: 'Resource', default: null },
    date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    start_time: { type: String, required: true }, // Format: HH:MM
    end_time: { type: String, required: true }, // Format: HH:MM
    min_participants: { type: Number, required: true },
    max_participants: { type: Number, required: true },
    min_team_members: { type: Number, default: null },
    max_team_members: { type: Number, default: null },
      categories: { type: [String], default: [] },
    registration_deadline: { type: Date, required: true },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'RESCHEDULED', 'CANCELLED'], default: 'PENDING' },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'events' }
);

export default mongoose.models.Event || mongoose.model<IEvent>('Event', eventSchema);
