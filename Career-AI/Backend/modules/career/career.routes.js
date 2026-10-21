
import express from "express";
import { authenticateToken } from "../../middleware/auth.middleware.js";
import CareerProfile from "../../models/CareerProfile.js";
import { buildCareerAnalysis } from "./career.service.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/profile", async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({
      userId: req.user.userId
    }).lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Career profile not found."
      });
    }

    return res.json({ success: true, profile });
  } catch (error) {
    console.error("Career profile load error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not load career profile."
    });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const { degree, field, targetRole, timelineMonths, knownSkills } =
      req.body;

    if (
      ![degree, field, targetRole].every(
        value => typeof value === "string" && value.trim()
      ) ||
      !Number.isInteger(Number(timelineMonths)) ||
      Number(timelineMonths) < 1 ||
      Number(timelineMonths) > 60 ||
      !Array.isArray(knownSkills) ||
      !knownSkills.every(
        skill => typeof skill === "string" && skill.trim()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Provide degree, field, targetRole, timelineMonths and knownSkills."
      });
    }

    const profile = await CareerProfile.findOneAndUpdate(
      { userId: req.user.userId },
      {
        $set: {
          degree: degree.trim(),
          field: field.trim(),
          targetRole: targetRole.trim(),
          timelineMonths: Number(timelineMonths),
          knownSkills: [...new Set(
            knownSkills.map(skill => skill.trim())
          )],
          updatedAt: new Date()
        },
        $setOnInsert: {
          userId: req.user.userId
        }
      },
      { returnDocument: "after", upsert: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: "Career profile saved.",
      profile,
      analysis: buildCareerAnalysis(profile)
    });
  } catch (error) {
    if (error.statusCode === 422) {
      return res.status(422).json({
        success: false,
        message: error.message
      });
    }

    console.error("Career profile save error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not save career profile."
    });
  }
});

router.get("/analysis", async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Save your career profile first."
      });
    }

    return res.json({
      success: true,
      analysis: buildCareerAnalysis(profile)
    });
  } catch (error) {
    console.error("Career analysis error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Could not generate career analysis."
    });
  }
});

router.patch("/skills/status", async (req, res) => {
  try {
    const { skill, status } = req.body;

    if (
      typeof skill !== "string" ||
      !skill.trim() ||
      !["completed", "active", "pending"].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide a skill and valid status."
      });
    }

    const profile = await CareerProfile.findOne({
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Career profile not found."
      });
    }

    const analysis = buildCareerAnalysis(profile);
    const matched = analysis.skills.find(
      item => item.name.toLowerCase() === skill.trim().toLowerCase()
    );

    if (!matched) {
      return res.status(404).json({
        success: false,
        message: "Skill is not part of this roadmap."
      });
    }

    const normalized = matched.name.toLowerCase();

    profile.completedSkills = profile.completedSkills.filter(
      item => item.toLowerCase() !== normalized
    );

    profile.knownSkills = profile.knownSkills.filter(
      item => item.toLowerCase() !== normalized
    );

    if (status === "completed") {
      profile.completedSkills.push(matched.name);
      profile.knownSkills.push(matched.name);
    } else if (status === "active") {
      profile.knownSkills.push(matched.name);
    }

    await profile.save();

    return res.json({
      success: true,
      analysis: buildCareerAnalysis(profile)
    });
  } catch (error) {
    console.error("Skill status update error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Could not update skill status."
    });
  }
});

export default router;
