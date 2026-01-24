import mongoose, { Schema, Document } from 'mongoose';

export interface IEventSlot extends Document {
  event_id: mongoose.Types.ObjectId;
  slot_number: number;
  allocated: boolean;
}

const eventSlotSchema = new Schema<IEventSlot>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    slot_number: { type: Number, required: true },
    allocated: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'event_slots' }
);

// Ensure unique slot per event
eventSlotSchema.index({ event_id: 1, slot_number: 1 }, { unique: true });

export default mongoose.models.EventSlot || mongoose.model<IEventSlot>('EventSlot', eventSlotSchema);
