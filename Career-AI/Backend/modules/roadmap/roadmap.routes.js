
import express from "express";
import { authenticateToken } from "../../middleware/auth.middleware.js";
import CareerProfile from "../../models/CareerProfile.js";
import { buildRoadmap } from "./roadmap.service.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/", async (req, res) => {
  try {
    const profile = await CareerProfile.findOne({
      userId: req.user.userId
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Save your career profile before loading the roadmap."
      });
    }

    return res.json({
      success: true,
      roadmap: buildRoadmap(profile)
    });
  } catch (error) {
    console.error("Roadmap load error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Could not load roadmap."
    });
  }
});

export default router;
