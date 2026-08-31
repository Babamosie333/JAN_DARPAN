import mongoose, { Schema, models, model } from "mongoose";

export const CATEGORY_KEYS = [
  "roads",
  "cleanliness",
  "lighting",
  "water",
  "greenery",
  "traffic",
  "accessibility",
  "services",
] as const;

export const SEVERITY_LEVELS = ["Low", "Moderate", "High", "Critical"] as const;
export const AFFECTED_SCOPES = ["Me", "My Street", "My Neighbourhood", "Large Public Area"] as const;
export const STATUS_VALUES = ["reported", "in-progress", "resolved", "rejected"] as const;

const IssueSchema = new Schema(
  {
    title: { type: String, required: true },
    category: { type: String, enum: CATEGORY_KEYS, required: true },
    areaId: { type: String, required: true, index: true }, // references Area.id
    location: { type: String, default: "Reported location" },
    coords: { type: [Number], default: undefined }, // [lat, lng]
    description: { type: String, default: "" },

    // Photo: a Cloudinary secure_url, uploaded via /api/upload before the issue is created.
    photo: { type: String, default: null },

    severity: { type: String, enum: SEVERITY_LEVELS, required: true },
    affected: { type: String, enum: AFFECTED_SCOPES, required: true },
    peopleAffected: { type: Number, default: 0 },
    priority: { type: Number, min: 0, max: 100, default: 0 },

    status: { type: String, enum: STATUS_VALUES, default: "reported" },
    confirms: { type: Number, default: 1 },

    // Who reported it — Clerk user id. Nullable to tolerate legacy/anonymous seed data.
    reportedBy: { type: String, default: null, index: true },
    confirmedBy: { type: [String], default: [] }, // Clerk user ids who confirmed

    resolvedAt: { type: Date, default: null },
    resolutionNote: { type: String, default: "" },
  },
  { timestamps: true }
);

export type IssueDoc = mongoose.InferSchemaType<typeof IssueSchema>;

export default models.Issue || model("Issue", IssueSchema);
