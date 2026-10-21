
import React, { useEffect, useState } from "react";
import Navbar from "../Navbar/navbar";
import "./drashboard.css";

import {
  Pencil,
  Target,
  FileText,
  TrendingUp,
  Sparkles,
  ArrowUpRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Route,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
const API_URL =
  `${import.meta.env.VITE_AI_API_BASE_URL || "http://127.0.0.1:8000"}/api/ai/chatbot`;

/* =========================================================
   HELPERS
========================================================= */

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("jwt") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("authToken") ||
    sessionStorage.getItem("jwt")
  );
};

const fetchJSON = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.detail ||
        data.message ||
        `Request failed (${response.status})`
    );
  }

  return data;
};

const normalizeStatus = (status) =>
  String(status || "pending").toLowerCase();

const getPercentage = (part, total) => {
  if (!total || total <= 0) return 0;

  return Math.max(
    0,
    Math.min(100, Math.round((part / total) * 100))
  );
};

const getStatusLabel = (score) => {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Good";
  if (score >= 35) return "Building";
  return "Getting Started";
};

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [market, setMarket] = useState(null);

  const [loading, setLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(false);
  const [error, setError] = useState("");
  const [marketError, setMarketError] = useState("");

  /* =======================================================
     LOAD DATABASE DATA + MARKET DATA
  ======================================================= */

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      setMarketError("");

      try {
        const token = getToken();

        if (!token) {
          throw new Error(
            "Please log in to view your career dashboard."
          );
        }

        // First load the saved career profile.
        const profileResponse = await fetchJSON(
          `${API_BASE_URL}/career/profile`,
          { token }
        );

        const savedProfile =
          profileResponse.profile ||
          profileResponse.data?.profile ||
          profileResponse.data ||
          null;

        if (!savedProfile) {
          throw new Error(
            "Career profile not found. Please complete your career options first."
          );
        }

        if (cancelled) return;

        setProfile(savedProfile);
        setMarketLoading(true);

        const targetRole =
          savedProfile.targetRole ||
          savedProfile.target_role ||
          "";

        // Load the saved analysis, roadmap and role market data together.
        const [analysisResult, roadmapResult, marketResult] =
          await Promise.allSettled([
            fetchJSON(`${API_BASE_URL}/career/analysis`, { token }),
            fetchJSON(`${API_BASE_URL}/roadmap`, { token }),
            targetRole
              ? fetchJSON(`${AI_BASE_URL}/market-analysis`, {
                  method: "POST",
                  body: JSON.stringify({ targetRole }),
                })
              : Promise.reject(
                  new Error("Target role is missing from your profile.")
                ),
          ]);

        if (cancelled) return;

        if (analysisResult.status === "fulfilled") {
          const response = analysisResult.value;

          setAnalysis(
            response.analysis ||
              response.data?.analysis ||
              response.data ||
              response
          );
        } else {
          setError(
            `Career analysis could not load: ${analysisResult.reason?.message || "Unknown error"}`
          );
        }

        if (roadmapResult.status === "fulfilled") {
          const response = roadmapResult.value;

          setRoadmap(
            response.roadmap ||
              response.data?.roadmap ||
              response.data ||
              response
          );
        } else {
          setError((previous) =>
            previous
              ? `${previous} | Roadmap: ${roadmapResult.reason?.message || "Unable to load"}`
              : `Roadmap could not load: ${roadmapResult.reason?.message || "Unknown error"}`
          );
        }

        if (marketResult.status === "fulfilled") {
          setMarket(marketResult.value);
        } else {
          setMarketError(
            marketResult.reason?.message ||
              "Market demand data could not be loaded."
          );
        }

        setMarketLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to load your dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setMarketLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  /* =======================================================
     DERIVE DYNAMIC DASHBOARD VALUES
  ======================================================= */

  const skills = Array.isArray(analysis?.skills)
    ? analysis.skills
    : [];

  const milestones = Array.isArray(roadmap?.milestones)
    ? roadmap.milestones
    : [];

  const totalSkills = Number(
    analysis?.totalSkills ?? skills.length
  );

  const completedByStatus = skills.filter(
    (skill) => normalizeStatus(skill.status) === "completed"
  ).length;

  const activeByStatus = skills.filter(
    (skill) => normalizeStatus(skill.status) === "active"
  ).length;

  const pendingByStatus = skills.filter(
    (skill) => normalizeStatus(skill.status) === "pending"
  ).length;

  const completedSkills = Number(
    analysis?.completedSkillCount ?? completedByStatus
  );

  const knownSkills = Number(
    analysis?.knownSkillCount ??
      completedByStatus + activeByStatus
  );

  const missingSkills = Number(
    analysis?.missingSkillCount ?? pendingByStatus
  );

  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      Number(
        analysis?.readinessPercentage ??
          roadmap?.readinessPercentage ??
          0
      )
    )
  );

  const totalMilestones = Number(
    roadmap?.totalMilestones ?? milestones.length
  );

  const completedMilestones = Number(
    roadmap?.completedMilestones ??
      milestones.filter(
        (item) => normalizeStatus(item.status) === "completed"
      ).length
  );

  const targetRole =
    profile?.targetRole ||
    analysis?.targetRole ||
    roadmap?.role ||
    "Career Profile";

  const qualification = [
    profile?.degree || analysis?.degree || roadmap?.degree,
    profile?.field || analysis?.field || roadmap?.field,
  ]
    .filter(Boolean)
    .join(" · ");

  const statusLabel = getStatusLabel(readinessScore);

  const progressData = [
    {
      label: "Skills Match",
      value: getPercentage(knownSkills, totalSkills),
      className: "skills",
    },
    {
      label: "Skills Completed",
      value: getPercentage(completedSkills, totalSkills),
      className: "experience",
    },
    {
      label: "Roadmap Progress",
      value: getPercentage(completedMilestones, totalMilestones),
      className: "aptitude",
    },
  ];

  const stats = [
    {
      value: totalSkills,
      label: "Core Skills",
      sub: "Identified",
      icon: Target,
      type: "purple",
    },
    {
      value: totalMilestones,
      label: "Career Steps",
      sub: "Planned",
      icon: Route,
      type: "blue",
    },
    {
      value: completedSkills,
      label: "Skills",
      sub: "Completed",
      icon: FileText,
      type: "green",
    },
  ];

  const monthlyDemand = Array.isArray(market?.monthlyDemand)
    ? market.monthlyDemand
    : [];

  const isEstimated =
    market?.sourceType === "illustrative_estimate";

  const nextSkill = skills.find(
    (skill) => normalizeStatus(skill.status) === "pending"
  );

  const nextMilestone = milestones.find(
    (item) => normalizeStatus(item.status) !== "completed"
  );

  const recommendation = nextSkill
    ? `Your next priority is ${nextSkill.name || nextSkill.skill || "your next pending skill"}. Continue your ${targetRole} roadmap to build your career readiness.`
    : nextMilestone
      ? `Your tracked skills are up to date. Continue with "${nextMilestone.title}" to make progress on your ${targetRole} roadmap.`
      : totalSkills > 0 && completedSkills >= totalSkills
        ? `All tracked skills are marked completed. Review your knowledge and keep practising for ${targetRole} opportunities.`
        : `Complete your career profile and roadmap to receive a personalized next-step recommendation.`;

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="canvas-container">
          <div className="glass-card readiness-card">
            <h3>Loading Your Career Canvas...</h3>
            <p>
              Fetching your saved profile, roadmap and market analysis.
            </p>
          </div>
        </div>
      </>
    );
  }

  /* =======================================================
     ERROR / MISSING PROFILE STATE
  ======================================================= */

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="canvas-container">
          <div className="glass-card readiness-card">
            <div className="section-label">
              <Brain size={15} />
              <span>Career Dashboard</span>
            </div>

            <h3>Your career profile is not available yet.</h3>
            <p>
              {error ||
                "Log in and complete your career options to load your dashboard."}
            </p>

            <button
              className="refine-btn"
              onClick={() =>
                navigate(getToken() ? "/options" : "/login")
              }
            >
              {getToken() ? "Complete Career Profile" : "Go to Login"}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <>
      <Navbar />

      <div className="canvas-container">
        {/* PAGE HEADER */}

        <header className="canvas-header">
          <div className="header-text">
            <div className="welcome-tag">
              <Sparkles size={13} />
              <span>AI CAREER INSIGHTS</span>
            </div>

            <h1>Your Career Canvas</h1>

            <p>
              Your saved career profile, roadmap progress and role-specific
              market estimates.
            </p>
          </div>

          <button
            className="refine-btn"
            onClick={() => navigate("/options")}
          >
            <Pencil size={14} />
            Refine Path
          </button>
        </header>

        {error && (
          <div className="glass-card readiness-card">
            <p>{error}</p>
          </div>
        )}

        {/* MAIN GRID */}

        <div className="canvas-main-grid">
          {/* CAREER READINESS */}

          <div className="glass-card readiness-card">
            <div className="card-top-line">
              <div className="readiness-header">
                <div className="section-label">
                  <Brain size={15} />
                  <span>Career Readiness</span>
                </div>

                <h3>Ready for the next step?</h3>

                <p>
                  Based on your {targetRole} profile
                  {qualification ? ` · ${qualification}` : ""}
                </p>
              </div>

              <div className="score-status">
                <CheckCircle2 size={13} />
                {statusLabel}
              </div>
            </div>

            <div className="circular-chart-placeholder">
              <div
                className="score-circle"
                style={{
                  background: `conic-gradient(#765bc2 0deg ${
                    readinessScore * 3.6
                  }deg, #e9e5f4 ${
                    readinessScore * 3.6
                  }deg 360deg)`,
                }}
              >
                <div className="score-content">
                  <span className="score-small">OVERALL SCORE</span>

                  <h2>{readinessScore}%</h2>

                  <span className="score-state">
                    {statusLabel.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            <div className="progress-bars">
              {progressData.map((item) => (
                <div className="progress-item" key={item.label}>
                  <div className="progress-info">
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>

                  <div className="progress-bg">
                    <div
                      className={`progress-fill ${item.className}`}
                      style={{
                        "--progress": `${item.value}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}

          <div className="right-column">
            {/* DYNAMIC STATS */}

            <div className="stats-row">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    className={`glass-card stat-card ${stat.type}`}
                    key={stat.label}
                  >
                    <div className="stat-top">
                      <div className="stat-icon">
                        <Icon size={17} />
                      </div>

                      <ArrowUpRight
                        className="stat-arrow"
                        size={15}
                      />
                    </div>

                    <div className="stat-number">{stat.value}</div>

                    <div className="stat-label">
                      {stat.label}
                      <span>{stat.sub}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* MARKET DEMAND */}

            <div className="glass-card chart-card">
              <div className="chart-header">
                <div>
                  <div className="chart-title">
                    <TrendingUp size={16} />
                    <h3>Market Demand</h3>
                  </div>

                  <p>
                    {market?.displayRole || targetRole} · Last{" "}
                    {monthlyDemand.length || 0} months
                  </p>
                </div>

                <div className="live-badge">
                  <span />
                  {marketLoading
                    ? "Loading"
                    : isEstimated
                      ? "Estimated"
                      : market?.available
                        ? "Market Data"
                        : "Unavailable"}
                </div>
              </div>

              {marketError && (
                <p className="market-error">{marketError}</p>
              )}

              {!marketLoading &&
                market?.available === false && (
                  <p>
                    {market.message ||
                      "Market data is not available for this role yet."}
                  </p>
                )}

              {monthlyDemand.length > 0 ? (
                <>
                  <div className="chart-area">
                    <div className="chart-grid">
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>

                    <div className="bars">
                      {monthlyDemand.map((item, index) => {
                        const value = Math.max(
                          0,
                          Math.min(100, Number(item.value) || 0)
                        );

                        return (
                          <div
                            className="bar-column"
                            key={`${item.month}-${index}`}
                            title={`${item.month}: ${value}`}
                          >
                            <div
                              className={`bar ${
                                index === monthlyDemand.length - 1
                                  ? "active"
                                  : ""
                              }`}
                              style={{
                                height: `${Math.max(value, 3)}%`,
                              }}
                            />

                            <span>{item.month}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

            
                </>
              ) : (
                !marketLoading && (
                  <p>
                    No monthly demand data is available for this role.
                  </p>
                )
              )}

              {marketLoading && (
                <p>Loading market demand data...</p>
              )}
            </div>
          </div>
        </div>

        {/* PERSONALIZED NEXT STEP */}

        <div className="glass-card insight-banner">
          <div className="insight-content">
            <div className="ai-icon">
              <Sparkles size={17} />
            </div>

            <div className="insight-text">
              <div className="insight-title">
                <h4>Curator AI Recommendation</h4>

                <span>Based on your saved roadmap</span>
              </div>

              <p>{recommendation}</p>

              {missingSkills > 0 && (
                <p>
                  <strong>{missingSkills}</strong> skills are still marked
                  as missing in your career analysis.
                </p>
              )}
            </div>
          </div>

          <button
            className="explore-btn"
            onClick={() => navigate("/roadmap")}
          >
            View Strategic Roadmap
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
