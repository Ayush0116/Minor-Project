// Backend/modules/market/market.service.js

import Market from "./market.model.js";

const AI_MODULE_URL = (
  process.env.AI_MODULE_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

const CACHE_DAYS = Number(process.env.MARKET_CACHE_DAYS || 30);
const REQUEST_TIMEOUT_MS = 120000;

const ALLOWED_YEARS = [2022, 2023, 2024, 2025, 2026];

export class MarketServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "MarketServiceError";
    this.statusCode = statusCode;
  }
}

function normalizeRole(role) {
  return role.trim().replace(/\s+/g, " ").toLowerCase();
}

function normalizeCountry(country) {
  return country.trim().replace(/\s+/g, " ");
}

function getCacheExpiry() {
  const days = Number.isFinite(CACHE_DAYS) && CACHE_DAYS > 0
    ? CACHE_DAYS
    : 30;

  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function cleanStringArray(value, maxItems = 50) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((item) => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    ),
  ].slice(0, maxItems);
}

function normalizeAIResponse(raw, role, country) {
  // AI response direct JSON ya { data: {...} } format mein aa sakta hai.
  const data = raw?.data ?? raw;

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new MarketServiceError(
      "AI-Module returned an invalid response.",
      502
    );
  }

  if (!Array.isArray(data.trends)) {
    throw new MarketServiceError(
      "AI response must contain a trends array.",
      502
    );
  }

  const trendsByYear = new Map();

  for (const item of data.trends) {
    const year = Number(item?.year);
    const value = Number(item?.value);

    if (
      !ALLOWED_YEARS.includes(year) ||
      !Number.isFinite(value) ||
      value < 0 ||
      value > 100
    ) {
      continue;
    }

    trendsByYear.set(year, {
      year,
      value,
      label:
        typeof item.label === "string"
          ? item.label.trim().slice(0, 100)
          : "",
    });
  }

  // Har saal ki value AI se aani chahiye.
  // Missing years ko fake values se fill nahi karenge.
  const trends = [...trendsByYear.values()].sort(
    (a, b) => a.year - b.year
  );

  if (trends.length !== ALLOWED_YEARS.length) {
    throw new MarketServiceError(
      "AI response must provide valid trend values for 2022–2026.",
      502
    );
  }

  const skills = cleanStringArray(data.skills);

  const validDirections = [
    "increasing",
    "stable",
    "decreasing",
    "unknown",
  ];

  const demandDirection = validDirections.includes(
    data.demandDirection
  )
    ? data.demandDirection
    : "unknown";

  // Jab tak reliable sources verify nahi hote,
  // AI-generated numbers ko verified nahi maanenge.
  const dataType =
    data.dataType === "illustrative"
      ? "illustrative"
      : "estimated";

  const sources = Array.isArray(data.sources)
    ? data.sources
        .filter(
          (source) =>
            source &&
            typeof source.title === "string" &&
            typeof source.url === "string" &&
            /^https?:\/\//i.test(source.url)
        )
        .slice(0, 20)
        .map((source) => ({
          title: source.title.trim().slice(0, 250),
          url: source.url.trim(),
          publishedAt: source.publishedAt
            ? new Date(source.publishedAt)
            : null,
        }))
        .map((source) => ({
          ...source,
          publishedAt:
            source.publishedAt &&
            !Number.isNaN(source.publishedAt.getTime())
              ? source.publishedAt
              : null,
        }))
    : [];

  return {
    role,
    normalizedRole: normalizeRole(role),
    country,
    trends,
    skills,
    summary:
      typeof data.summary === "string"
        ? data.summary.trim().slice(0, 2000)
        : "",
    demandDirection,
    dataType,
    sources,
    generatedAt: new Date(),
    expiresAt: getCacheExpiry(),
  };
}

async function requestAIAnalysis(role, country) {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(
      `${AI_MODULE_URL}/api/ai/market-analysis`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          country,
          years: ALLOWED_YEARS,
        }),
        signal: controller.signal,
      }
    );

    if (!response.ok) {
      const details = await response.text().catch(() => "");

      console.error(
        "Market AI request failed:",
        response.status,
        details.slice(0, 500)
      );

      throw new MarketServiceError(
        response.status === 429
          ? "AI rate limit reached. Please try again later."
          : "AI-Module could not generate market analysis.",
        response.status === 429 ? 429 : 502
      );
    }

    let result;

    try {
      result = await response.json();
    } catch {
      throw new MarketServiceError(
        "AI-Module returned invalid JSON.",
        502
      );
    }

    return normalizeAIResponse(result, role, country);
  } catch (error) {
    if (error instanceof MarketServiceError) {
      throw error;
    }

    if (error.name === "AbortError") {
      throw new MarketServiceError(
        "Market analysis timed out. Please try again.",
        504
      );
    }

    console.error("Market AI connection error:", error.message);

    throw new MarketServiceError(
      "Unable to connect to AI-Module.",
      502
    );
  } finally {
    clearTimeout(timeout);
  }
}

function toPublicResponse(document) {
  return {
    role: document.role,
    country: document.country,
    trends: document.trends,
    skills: document.skills,
    summary: document.summary,
    demandDirection: document.demandDirection,
    dataType: document.dataType,
    sources: document.sources,
    generatedAt: document.generatedAt,
    updatedAt: document.updatedAt,
    cacheExpiresAt: document.expiresAt,
  };
}

export async function getMarketAnalysis({
  role,
  country = "India",
  refresh = false,
}) {
  if (typeof role !== "string" || !role.trim()) {
    throw new MarketServiceError(
      "A target role is required.",
      400
    );
  }

  if (role.trim().length > 150) {
    throw new MarketServiceError(
      "Target role must be 150 characters or fewer.",
      400
    );
  }

  if (typeof country !== "string" || !country.trim()) {
    throw new MarketServiceError(
      "Country is required.",
      400
    );
  }

  if (country.trim().length > 100) {
    throw new MarketServiceError(
      "Country must be 100 characters or fewer.",
      400
    );
  }

  const cleanRole = role.trim().replace(/\s+/g, " ");
  const cleanCountry = normalizeCountry(country);
  const normalizedRole = normalizeRole(cleanRole);

  let cached = await Market.findOne({
    normalizedRole,
    country: cleanCountry,
  }).lean();

  const isFresh =
    cached?.expiresAt &&
    new Date(cached.expiresAt).getTime() > Date.now();

  if (!refresh && cached && isFresh) {
    return {
      ...toPublicResponse(cached),
      cacheHit: true,
    };
  }

  // AI se fresh data generate karo.
  const generated = await requestAIAnalysis(
    cleanRole,
    cleanCountry
  );

  // Concurrent requests ke case mein unique index duplicate
  // documents ko rokega; existing document update ho jayega.
  const saved = await Market.findOneAndUpdate(
    { normalizedRole, country: cleanCountry },
    { $set: generated },
   {
  returnDocument: "after",
  upsert: true,
  runValidators: true,
  setDefaultsOnInsert: true,
}
  ).lean();

  return {
    ...toPublicResponse(saved),
    cacheHit: false,
  };
}