import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
      default: "Beginner",
    },
    proficiency: { type: Number, min: 0, max: 100, default: 50 },
  },
  { _id: true }
);

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true, default: "" },
    institution: { type: String, trim: true, default: "" },
    field: { type: String, trim: true, default: "" },
    startYear: { type: String, default: "" },
    endYear: { type: String, default: "" },
    location: { type: String, default: "" },
  },
  { _id: true }
);

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String, trim: true, default: "" },
    year: { type: String, default: "" },
  },
  { _id: true }
);

const profileSchema = new mongoose.Schema(
  {
    // One profile per authenticated user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    fullName: { type: String, trim: true, default: "" },
    headline: { type: String, trim: true, default: "Student" },
    email: { type: String, trim: true, lowercase: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    dateOfBirth: { type: String, default: "" },

    summary: { type: String, trim: true, default: "" },
    industry: { type: String, trim: true, default: "" },
    experienceYears: { type: Number, min: 0, default: 0 },
    availability: { type: String, default: "" },

    skills: { type: [skillSchema], default: [] },
    education: { type: [educationSchema], default: [] },
    achievements: { type: [achievementSchema], default: [] },

    links: {
      linkedin: { type: String, trim: true, default: "" },
      github: { type: String, trim: true, default: "" },
      portfolio: { type: String, trim: true, default: "" },
      other: [
        {
          label: { type: String, trim: true, default: "" },
          url: { type: String, trim: true, default: "" },
        },
      ],
    },

    careerPreferences: {
      targetRole: { type: String, trim: true, default: "" },
      preferredIndustries: { type: [String], default: [] },
      workMode: { type: String, default: "Hybrid / Remote" },
      targetLocations: { type: [String], default: [] },
      expectedSalary: { type: String, default: "" },
      noticePeriod: { type: String, default: "" },
    },

    visibility: { type: String, enum: ["public", "private"], default: "public" },
    profileViews: { type: Number, default: 0 },
    applications: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", profileSchema);

export default UserProfile;