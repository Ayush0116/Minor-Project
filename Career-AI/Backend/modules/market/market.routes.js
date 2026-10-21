// Backend/modules/market/market.routes.js

import express from "express";
import {
  getMarketAnalysis,
  MarketServiceError,
} from "./market.service.js";

const router = express.Router();

function handleError(error, res) {
  if (error instanceof MarketServiceError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  console.error("Market API error:", error);

  return res.status(500).json({
    success: false,
    message: "Failed to process market analysis.",
  });
}

// GET /api/market/trends?role=Data%20Scientist&country=India
router.get("/trends", async (req, res) => {
  try {
    const { role, country = "India" } = req.query;

    const result = await getMarketAnalysis({
      role,
      country,
    });

    return res.status(200).json({
      success: true,
      message: "Market trends fetched successfully.",
      data: result,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

// GET /api/market/skills?role=Data%20Scientist&country=India
router.get("/skills", async (req, res) => {
  try {
    const { role, country = "India" } = req.query;

    const result = await getMarketAnalysis({
      role,
      country,
    });

    return res.status(200).json({
      success: true,
      message: "Role skills fetched successfully.",
      data: {
        role: result.role,
        country: result.country,
        skills: result.skills,
        dataType: result.dataType,
        generatedAt: result.generatedAt,
      },
    });
  } catch (error) {
    return handleError(error, res);
  }
});

// POST /api/market/refresh
// Body: { "role": "Data Scientist", "country": "India" }
router.post("/refresh", async (req, res) => {
  try {
    const { role, country = "India" } = req.body ?? {};

    const result = await getMarketAnalysis({
      role,
      country,
      refresh: true,
    });

    return res.status(200).json({
      success: true,
      message: "Market analysis refreshed successfully.",
      data: result,
    });
  } catch (error) {
    return handleError(error, res);
  }
});

export default router;