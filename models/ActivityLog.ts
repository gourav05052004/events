import mongoose, { Schema, Document } from 'mongoose';

export type ActorType = 'ADMIN' | 'CLUB';

export interface IActivityLog extends Document {
  actor_type: ActorType;
  actor_id: mongoose.Types.ObjectId;
  action: string;
  target_event_id: mongoose.Types.ObjectId | null;
  created_at: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    actor_type: { type: String, enum: ['ADMIN', 'CLUB'], required: true },
    actor_id: { type: Schema.Types.ObjectId, required: true },
    action: { type: String, required: true },
    target_event_id: { type: Schema.Types.ObjectId, ref: 'Event', default: null },
    created_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'activity_logs' }
);

// Index for efficient log queries
activityLogSchema.index({ created_at: -1 });
activityLogSchema.index({ actor_type: 1, actor_id: 1 });

export default mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
