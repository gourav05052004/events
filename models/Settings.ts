import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  platformName: string;
  platformDescription?: string;
  maintenanceMode: boolean;
  maintenanceModeMessage?: string;
  updated_at: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    platformName: { type: String, default: 'V-Sphere Events Management' },
    platformDescription: { type: String, default: 'Event Management Platform' },
    maintenanceMode: { type: Boolean, default: false },
    maintenanceModeMessage: { 
      type: String, 
      default: 'The platform is currently under maintenance. Please try again later.' 
    },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: false, collection: 'settings' }
);

// Ensure only one settings document exists
settingsSchema.statics.getInstance = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      platformName: 'V-Sphere Events Management',
      platformDescription: 'Event Management Platform',
      maintenanceMode: false,
    });
  }
  return settings;
};

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', settingsSchema);
