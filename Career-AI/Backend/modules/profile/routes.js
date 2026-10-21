
import express from "express";
import mongoose from "mongoose";

import UserProfile from "../../models/UserProfile.js";
import { authenticateToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Get the authenticated user's ID
const getUserId = (req) => req.user?.userId;

// Fields allowed to be updated by the user
const editableFields = [
  "fullName",
  "headline",
  "phone",
  "location",
  "dateOfBirth",
  "summary",
  "industry",
  "experienceYears",
  "availability",
  "skills",
  "education",
  "achievements",
  "links",
  "careerPreferences",
  "visibility",
];

// GET /api/profile
// Fetch the logged-in user's profile
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user ID.",
      });
    }

    let profile = await UserProfile.findOne({
      user: userId,
    });

    // Create a profile on the user's first visit
    if (!profile) {
      profile = await UserProfile.create({
        user: userId,
      });
    }

    return res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load profile.",
    });
  }
});

// PUT /api/profile
// Create or update the logged-in user's profile
router.put("/", authenticateToken, async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        success: false,
        message: "Invalid authenticated user ID.",
      });
    }

    const body = req.body || {};
    const data = {};

    // Accept only permitted fields
    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        data[field] = body[field];
      }
    }

    // Validate experience years
    if (data.experienceYears !== undefined) {
      const years = Number(data.experienceYears);

      if (
        data.experienceYears === "" ||
        !Number.isFinite(years) ||
        years < 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Experience years must be a non-negative number.",
        });
      }

      data.experienceYears = years;
    }

    // Validate visibility
    if (
      data.visibility !== undefined &&
      !["public", "private"].includes(data.visibility)
    ) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be public or private.",
      });
    }

    const profile = await UserProfile.findOneAndUpdate(
      { user: userId },
      {
        $set: data,
        $setOnInsert: {
          user: userId,
        },
      },
      {
        upsert: true,
        returnDocument: "after",
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "Profile saved successfully.",
      profile,
    });
  } catch (error) {
    console.error("PUT /api/profile error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid profile data.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to save profile.",
    });
  }
});

export default router;
