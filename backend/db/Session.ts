import mongoose, { Document, Schema } from 'mongoose';
import { ReviewSession } from '../models/orchestrator.types.js';

export interface ISession extends Omit<ReviewSession, 'createdAt' | 'updatedAt'>, Document {
  id: string; // Keep original id field mapped to our UUID
  createdAt: Date;
  updatedAt: Date;
}

const TimelineEventSchema = new Schema({
  timestamp: { type: Date, required: true },
  event: { type: String, required: true },
  agent: { type: String },
  details: { type: Schema.Types.Mixed },
}, { _id: false });

const SessionSchema = new Schema<ISession>({
  id: { type: String, required: true, unique: true },
  status: { type: String, required: true },
  reviewRequest: { type: Schema.Types.Mixed, required: true }, // Store GitHub types as Mixed for flexibility
  timeline: { type: [TimelineEventSchema], default: [] },
  contextBundle: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: true });

export const SessionModel = mongoose.model<ISession>('Session', SessionSchema);
