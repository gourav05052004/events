import mongoose, { Schema, Document } from 'mongoose';

export type RegistrationStatus = 'CONFIRMED' | 'WAITLISTED';

export interface IEventRegistration extends Document {
  event_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
  status: RegistrationStatus;
  registered_at: Date;
}

const eventRegistrationSchema = new Schema<IEventRegistration>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    status: { type: String, enum: ['CONFIRMED', 'WAITLISTED'], default: 'CONFIRMED' },
    registered_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'event_registrations' }
);

// Prevent duplicate registrations for same student and event
eventRegistrationSchema.index({ event_id: 1, student_id: 1 }, { unique: true });

export default mongoose.models.EventRegistration ||
  mongoose.model<IEventRegistration>('EventRegistration', eventRegistrationSchema);
