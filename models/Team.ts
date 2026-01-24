import mongoose, { Schema, Document } from 'mongoose';

export interface ITeam extends Document {
  event_id: mongoose.Types.ObjectId;
  team_name: string;
  team_leader_id: mongoose.Types.ObjectId;
  created_at: Date;
}

const teamSchema = new Schema<ITeam>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    team_name: { type: String, required: true },
    team_leader_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'teams' }
);

export default mongoose.models.Team || mongoose.model<ITeam>('Team', teamSchema);
