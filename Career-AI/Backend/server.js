
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { connectDB } from "./config/db.js";
import authRoutes from "./modules/auth/auth.routes.js";
import { authenticateToken } from "./middleware/auth.middleware.js";
import User from "./models/User.js";
import youtubeRoutes from "./modules/youtube/youtube.routes.js";
import careerRoutes from "./modules/career/career.routes.js";
import roadmapRoutes from "./modules/roadmap/roadmap.routes.js";
import marketRoutes from "./modules/market/market.routes.js";
import profileRoutes from "./modules/profile/routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors());
app.use(express.json({ limit: "20kb" }));

// --------------------------------------------------
// CATALOG MODELS
// Collection names match the existing seed script.
// --------------------------------------------------

const qualificationSchema = new mongoose.Schema(
  {
    name: String,
    code: String,
    isActive: { type: Boolean, default: true },
  },
  { collection: "qualifications" }
);

const fieldSchema = new mongoose.Schema(
  {
    name: String,
    code: String,
    qualification: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Qualification",
    },
    isActive: { type: Boolean, default: true },
  },
  { collection: "fields" }
);

const skillSchema = new mongoose.Schema(
  {
    name: String,
    category: String,
    isActive: { type: Boolean, default: true },
  },
  { collection: "skills" }
);

const targetRoleSchema = new mongoose.Schema(
  {
    name: String,
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Field",
    },
    skills: [
      {
        skill: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Skill",
        },
        estimatedHours: { type: Number, default: 0 },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { collection: "targetroles" }
);

const Qualification =
  mongoose.models.Qualification ||
  mongoose.model("Qualification", qualificationSchema);

const Field =
  mongoose.models.Field ||
  mongoose.model("Field", fieldSchema);

const Skill =
  mongoose.models.Skill ||
  mongoose.model("Skill", skillSchema);

const TargetRole =
  mongoose.models.TargetRole ||
  mongoose.model("TargetRole", targetRoleSchema);

// --------------------------------------------------
// COMMON RESPONSE HELPERS
// --------------------------------------------------

function sendError(res, error, message) {
  console.error(message, error.message);

  return res.status(500).json({
    success: false,
    message,
  });
}

// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Career-AI Backend is running",
  });
});

// --------------------------------------------------
// CATALOG API: QUALIFICATIONS
// GET /api/qualifications
// --------------------------------------------------

app.get("/api/qualifications", async (req, res) => {
  try {
    const qualifications = await Qualification.find({
      isActive: { $ne: false },
    })
      .select("name code")
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      data: qualifications,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Could not load qualifications."
    );
  }
});

// --------------------------------------------------
// CATALOG API: FIELDS
// GET /api/fields?qualification=QUALIFICATION_ID
// --------------------------------------------------

app.get("/api/fields", async (req, res) => {
  try {
    const { qualification } = req.query;

    if (!qualification) {
      return res.status(400).json({
        success: false,
        message: "Qualification ID is required.",
      });
    }

    if (!mongoose.isValidObjectId(qualification)) {
      return res.status(400).json({
        success: false,
        message: "Invalid qualification ID.",
      });
    }

    const fields = await Field.find({
      qualification,
      isActive: { $ne: false },
    })
      .select("name code qualification")
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      data: fields,
    });
  } catch (error) {
    return sendError(res, error, "Could not load fields.");
  }
});

// --------------------------------------------------
// CATALOG API: SKILLS
// GET /api/skills
// --------------------------------------------------

app.get("/api/skills", async (req, res) => {
  try {
    const skills = await Skill.find({
      isActive: { $ne: false },
    })
      .select("name category")
      .sort({ name: 1 })
      .lean();

    return res.json({
      success: true,
      data: skills,
    });
  } catch (error) {
    return sendError(res, error, "Could not load skills.");
  }
});

// --------------------------------------------------
// CATALOG API: TARGET ROLES
// GET /api/roles?field=FIELD_ID
// --------------------------------------------------

app.get("/api/roles", async (req, res) => {
  try {
    const { field } = req.query;

    if (!field) {
      return res.status(400).json({
        success: false,
        message: "Field ID is required.",
      });
    }

    if (!mongoose.isValidObjectId(field)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field ID.",
      });
    }

    const roles = await TargetRole.find({
      field,
      isActive: { $ne: false },
    })
      .populate("skills.skill", "name category")
      .select("name field skills")
      .sort({ name: 1 })
      .lean();

    // Return skill objects in a frontend-friendly format.
    const formattedRoles = roles.map((role) => ({
      _id: role._id,
      name: role.name,
      field: role.field,
      skills: (role.skills || [])
        .filter((item) => item.skill)
        .map((item) => ({
          _id: item.skill._id,
          name: item.skill.name,
          category: item.skill.category,
          estimatedHours: item.estimatedHours,
        })),
    }));

    return res.json({
      success: true,
      data: formattedRoles,
    });
  } catch (error) {
    return sendError(res, error, "Could not load target roles.");
  }
});

// --------------------------------------------------
// EXISTING APPLICATION ROUTES
// --------------------------------------------------

app.use("/api/auth", authRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/profile", profileRoutes);

// --------------------------------------------------
// AUTHENTICATED USER PROFILE
// --------------------------------------------------

app.get("/api/auth/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Profile error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Could not load profile.",
    });
  }
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Career-AI Backend running at http://localhost:${PORT}`
      );
      console.log("Catalog APIs registered:");
      console.log("GET /api/qualifications");
      console.log("GET /api/fields?qualification=ID");
      console.log("GET /api/roles?field=ID");
      console.log("GET /api/skills");
    });
  } catch (error) {
    console.error("Backend startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
