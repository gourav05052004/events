import mongoose, { Schema, Document } from 'mongoose';

export type ClubRole = 'ORGANIZER' | 'CO_ORGANIZER';

export interface IEventClub extends Document {
  event_id: mongoose.Types.ObjectId;
  club_id: mongoose.Types.ObjectId;
  role: ClubRole;
}

const eventClubSchema = new Schema<IEventClub>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    club_id: { type: Schema.Types.ObjectId, ref: 'Club', required: true },
    role: { type: String, enum: ['ORGANIZER', 'CO_ORGANIZER'], required: true },
  },
  { timestamps: true, collection: 'event_clubs' }
);

// Ensure unique event-club-role combination
eventClubSchema.index({ event_id: 1, club_id: 1 }, { unique: true });

export default mongoose.models.EventClub || mongoose.model<IEventClub>('EventClub', eventClubSchema);
