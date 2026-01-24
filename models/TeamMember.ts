import mongoose, { Schema, Document } from 'mongoose';

export interface ITeamMember extends Document {
  team_id: mongoose.Types.ObjectId;
  student_id: mongoose.Types.ObjectId;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    team_id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
    student_id: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  },
  { timestamps: true, collection: 'team_members' }
);

// Prevent duplicate members in same team
teamMemberSchema.index({ team_id: 1, student_id: 1 }, { unique: true });

export default mongoose.models.TeamMember || mongoose.model<ITeamMember>('TeamMember', teamMemberSchema);
