/* models/Settings.ts */
import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
  baseIncome: number;
  bucketBudgets: {
    needs: number;
    wants: number;
    savings: number;
  };
}

const SettingsSchema = new Schema<ISettings>(
  {
    baseIncome: { type: Number, default: 0 },
    bucketBudgets: {
      needs: { type: Number, default: 9900 },
      wants: { type: Number, default: 5940 },
      savings: { type: Number, default: 3960 },
    },
  },
  { timestamps: true }
);

export const Settings = mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);