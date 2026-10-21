
import mongoose from "mongoose";

const careerProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },
    degree: {
      type: String,
      required: true,
      trim: true
    },
    field: {
      type: String,
      required: true,
      trim: true
    },
    targetRole: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    timelineMonths: {
      type: Number,
      required: true,
      min: 1,
      max: 60
    },
    knownSkills: {
      type: [String],
      default: []
    },
    completedSkills: {
      type: [String],
      default: []
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("CareerProfile", careerProfileSchema);
