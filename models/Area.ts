import mongoose, { Schema, models, model } from "mongoose";

const CategoriesSchema = new Schema(
  {
    roads: { type: Number, min: 0, max: 100, required: true },
    cleanliness: { type: Number, min: 0, max: 100, required: true },
    lighting: { type: Number, min: 0, max: 100, required: true },
    water: { type: Number, min: 0, max: 100, required: true },
    greenery: { type: Number, min: 0, max: 100, required: true },
    traffic: { type: Number, min: 0, max: 100, required: true },
    accessibility: { type: Number, min: 0, max: 100, required: true },
    services: { type: Number, min: 0, max: 100, required: true },
  },
  { _id: false }
);

const AlertSchema = new Schema(
  {
    tone: { type: String, enum: ["green", "orange", "red", "blue"], default: "blue" },
    text: { type: String, required: true },
  },
  { _id: false }
);

const TrendPointSchema = new Schema(
  {
    month: { type: String, required: true },
    score: { type: Number, required: true },
  },
  { _id: false }
);

const AreaSchema = new Schema(
  {
    id: { type: String, required: true, unique: true }, // slug, e.g. "kalyanpur"
    name: { type: String, required: true },
    city: { type: String, default: "Kanpur, Uttar Pradesh" },
    score: { type: Number, min: 0, max: 100, required: true },
    delta: { type: Number, default: 0 },
    grid: {
      row: { type: Number, required: true },
      col: { type: Number, required: true },
    },
    categories: { type: CategoriesSchema, required: true },
    activeIssues: { type: Number, default: 0 },
    resolvedThisMonth: { type: Number, default: 0 },
    citizens: { type: Number, default: 0 },
    impacted: { type: String, default: "0" },
    trend: { type: [TrendPointSchema], default: [] },
    improvements: { type: [String], default: [] },
    alerts: { type: [AlertSchema], default: [] },
    nearby: { type: Schema.Types.Mixed, default: {} }, // { Hospitals: [...], Schools: [...] }
  },
  { timestamps: true }
);

export type AreaDoc = mongoose.InferSchemaType<typeof AreaSchema>;

export default models.Area || model("Area", AreaSchema);
