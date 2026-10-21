// Backend/modules/market/market.model.js

import mongoose from "mongoose";

const marketTrendSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      min: 2022,
      max: 2026,
    },
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    label: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false }
);

const marketSourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: "",
    },
    url: {
      type: String,
      trim: true,
      default: "",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const marketSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: true,
      trim: true,
    },
    normalizedRole: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },
    trends: {
      type: [marketTrendSchema],
      default: [],
    },
    skills: {
      type: [String],
      default: [],
    },
    summary: {
      type: String,
      default: "",
      trim: true,
    },
    demandDirection: {
      type: String,
      enum: ["increasing", "stable", "decreasing", "unknown"],
      default: "unknown",
    },
    dataType: {
      type: String,
      enum: ["verified", "estimated", "illustrative"],
      default: "estimated",
    },
    sources: {
      type: [marketSourceSchema],
      default: [],
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Ek role + country ke liye ek cached document.
marketSchema.index(
  { normalizedRole: 1, country: 1 },
  { unique: true }
);

const Market = mongoose.model("Market", marketSchema);

export default Market;