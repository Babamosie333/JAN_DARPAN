import mongoose, { Schema, models, model } from "mongoose";

/**
 * Clerk owns identity (name, email, avatar, password/OAuth).
 * This collection owns everything civic-app-specific tied to that identity:
 * points, badges, and per-user stats — the equivalent of the old
 * localStorage STATE object in app.js, now persisted server-side.
 */
const CitizenProfileSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    points: { type: Number, default: 0 },
    badges: { type: [String], default: [] },
    reportedCount: { type: Number, default: 0 },
    confirmedCount: { type: Number, default: 0 },
    verifiedCount: { type: Number, default: 0 },
    azadiScore: { type: Number, default: 0, min: 0, max: 75 },
  },
  { timestamps: true }
);

export type CitizenProfileDoc = mongoose.InferSchemaType<typeof CitizenProfileSchema>;

export default models.CitizenProfile || model("CitizenProfile", CitizenProfileSchema);
