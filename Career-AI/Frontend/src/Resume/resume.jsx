
import React, { useRef, useState } from "react";
import {
  FileText,
  UploadCloud,
  AlertTriangle,
  ListChecks,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Target,
  ShieldAlert,
  BarChart3,
  Wand2,
  Lightbulb,
  ScanSearch,
  FileCheck2,
  Clock3,
  Zap,
  ChevronRight,
  CircleAlert,
  TrendingUp,
  X,
} from "lucide-react";

import "./resume.css";
import Navbar from "../Navbar/navbar";

const resume = () => {
const AI_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL ||
  "https://career-ai-module.onrender.com";
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [actionResult, setActionResult] = useState(null);
  const [summaryInput, setSummaryInput] = useState("");
  const [bulletsInput, setBulletsInput] = useState("");
  const [planInput, setPlanInput] = useState("");
  const [showSummaryInput, setShowSummaryInput] = useState(false);
  const [showBulletsInput, setShowBulletsInput] = useState(false);
  const [showPlanInput, setShowPlanInput] = useState(false);

  const handleFile = (file) => {
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!["pdf", "docx"].includes(extension)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Maximum file size is 5MB.");
      return;
    }

    setSelectedFile(file);
    setAnalysis(null);
    setActionResult(null);
    setError("");
  };

  const handleInputChange = (e) => {
    handleFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setActionResult(null);
    setError("");
    setSummaryInput("");
    setBulletsInput("");
    setPlanInput("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please upload your resume first.");
      return;
    }

    const role = window.prompt(
      "Enter your target job role:",
      targetRole
    );

    if (role === null) return;

    if (!role.trim()) {
      setError("Please enter a valid target role.");
      return;
    }

    setTargetRole(role.trim());
    setLoading(true);
    setError("");
    setAnalysis(null);
    setActionResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("targetRole", role.trim());

      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Resume analysis failed."
        );
      }

      setAnalysis(data);
    } catch (err) {
      setError(
        err.message ||
          "Unable to connect to the AI server. Check that FastAPI is running on port 8000."
      );
    } finally {
      setLoading(false);
    }
  };

  const runImprovement = async (action, endpoint, text) => {
    if (!text?.trim()) {
      setError("Please enter your existing resume content first.");
      return;
    }

    setActionLoading(action);
    setError("");
    setActionResult(null);

    try {
const response = await fetch(`${AI_BASE_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          targetRole,
          text: text.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "AI request failed."
        );
      }

      setActionResult(data);
    } catch (err) {
      setError(err.message || "Unable to complete the AI request.");
    } finally {
      setActionLoading("");
    }
  };

  const handleGenerateExamples = () => {
    if (!analysis) {
      setError("Analyze your resume first to get AI recommendations.");
      return;
    }

    const examples = (analysis.recommendations || []).map((item) => ({
      title: item.title,
      example: item.example || item.description,
    }));

    setError("");
    setActionResult({
      success: true,
      action: "examples",
      result: examples,
    });
  };

  const score = analysis?.score ?? null;
  const missingSkills = analysis?.missingSkills ?? [];
  const weaknesses = analysis?.weaknesses ?? [];
  const recommendations = analysis?.recommendations ?? [];
  const strengths = analysis?.strengths ?? [];

  const getScoreLabel = () => {
    if (!analysis) return "Awaiting analysis";
    return analysis.scoreLabel || "Analysis completed";
  };

  const getPriorityClass = (priority) => {
    const value = String(priority || "").toLowerCase();

    if (value === "high" || value === "critical") return "high";
    if (value === "low") return "low";
    return "medium";
  };

  return (
    <>
      <Navbar />
      <div className="resume-container">
        {/* MAIN CONTENT */}
        <div className="resume-content">
          {/* HEADER */}
          <div className="resume-header">
            <div className="resume-heading-row">
              <div>
                <div className="resume-eyebrow">
                  <Sparkles size={12} />
                  AI-POWERED CAREER INTELLIGENCE
                </div>

                <h1>Resume Intelligence</h1>

                <p>
                  Upload your latest resume and get an AI-powered breakdown
                  of your strengths, weaknesses and hiring readiness.
                </p>
              </div>

              <div className="resume-header-score">
                <div className="header-score-icon">
                  <BarChart3 size={16} />
                </div>

                <div>
                  <span>LAST ANALYSIS</span>
                  <strong>
                    {loading
                      ? "Analyzing..."
                      : analysis
                      ? "Completed"
                      : "Not analyzed"}
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* UPLOAD AREA */}
          <div
            className={`upload-box-card ${
              isDragging ? "drag-active" : ""
            } ${selectedFile ? "file-selected" : ""}`}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {!selectedFile ? (
              <>
                <div className="upload-decoration upload-decoration-one"></div>
                <div className="upload-decoration upload-decoration-two"></div>

                <div className="upload-status-badge">
                  <span></span>
                  SECURE UPLOAD
                </div>

                <h3>Drop your resume here</h3>

                <p>
                  Upload your PDF or DOCX and let our AI analyze
                  your experience, skills..
                </p>

                <div className="upload-actions">
                  <button
                    className="browse-files-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <FileText size={14} />
                    Browse Resume
                  </button>

                  <span className="upload-or">or drag &amp; drop</span>
                </div>

                <div className="upload-meta">
                  <span>
                    <ShieldAlert size={12} />
                    Private &amp; secure
                  </span>

                  <span>
                    <FileCheck2 size={12} />
                    PDF / DOCX
                  </span>

                  <span>
                    <Clock3 size={12} />
                    Max 5MB
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleInputChange}
                  hidden
                />
              </>
            ) : (
              <div className="selected-file-wrapper">
                <div className="selected-file-icon">
                  <FileCheck2 size={24} />
                </div>

                <div className="selected-file-info">
                  <span className="selected-file-label">
                    RESUME READY FOR ANALYSIS
                  </span>

                  <strong>{selectedFile.name}</strong>

                  <small>
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    {" • "}
                    {analysis ? "Analysis completed" : "Ready to analyze"}
                  </small>
                </div>

                <div className="selected-file-actions">
                  <button
                    className="analyze-resume-btn"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    <Sparkles size={14} />
                    {loading ? "Analyzing..." : "Analyze Resume"}
                    <ArrowRight size={14} />
                  </button>

                  <button
                    className="remove-file-btn"
                    onClick={removeFile}
                    aria-label="Remove resume"
                    disabled={loading}
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div
              role="alert"
              style={{
                margin: "0",
                padding: "12px 14px",
                borderRadius: "10px",
                border: "1px solid #efb6b6",
                color: "#b42318",
                background: "#fff4f2",
                fontSize: "13px",
              }}
            >
              <CircleAlert
                size={15}
                style={{
                  display: "inline",
                  verticalAlign: "middle",
                  marginRight: "7px",
                }}
              />
              {error}
            </div>
          )}

          {actionResult && (
            <div
              className="resume-card"
              style={{ marginTop: "0", marginBottom: "0" }}
            >
              <div className="card-title-row">
                <span className="icon-title-box purple-bg">
                  <Sparkles size={15} />
                </span>

                <div>
                  <h3>
                    {actionResult.action === "summary"
                      ? "Improved Summary"
                      : actionResult.action === "bullets"
                      ? "Rewritten Bullets"
                      : actionResult.action === "plan"
                      ? "Resume Improvement Plan"
                      : "Recommendation Examples"}
                  </h3>
                  <span className="card-mini-label">
                    AI-generated suggestions — verify before using
                  </span>
                </div>
              </div>

              {typeof actionResult.result === "string" ? (
                <p style={{ lineHeight: 1.7, whiteSpace: "pre-wrap" }}>
                  {actionResult.result}
                </p>
              ) : Array.isArray(actionResult.result) ? (
                <div>
                  {actionResult.result.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "12px 0",
                        borderBottom: "1px solid #eeeeF4",
                      }}
                    >
                      {typeof item === "string" ? (
                        <p>{item}</p>
                      ) : (
                        <>
                          <strong>
                            {item.title || item.task || item.priority || ""}
                          </strong>

                          {item.priority && (
                            <span style={{ marginLeft: "8px", fontSize: "12px" }}>
                              {item.priority}
                            </span>
                          )}

                          <p style={{ marginTop: "6px", lineHeight: 1.6 }}>
                            {item.example ||
                              item.reason ||
                              item.description ||
                              ""}
                          </p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>No result was returned.</p>
              )}
            </div>
          )}

          {/* ANALYTICS GRID */}
          <div className="resume-grid">
            {/* LEFT STACK */}
            <div className="resume-left-stack">
              {/* AI SCORE */}
              <div className="resume-card score-card">
                <div className="score-card-header">
                  <div>
                    <span className="card-label-top">
                      <span className="label-status-dot"></span>
                      OVERALL AI SCORE
                    </span>

                    <div className="score-context">
                      Resume strength compared with target roles
                    </div>
                  </div>

                  <div className="score-card-icon">
                    <TrendingUp size={16} />
                  </div>
                </div>

                <div className="score-display">
                  <div className="score-number">
                    {score === null ? "--" : score}
                  </div>

                  <div className="score-total">
                    <span>/</span>
                    100
                  </div>

                  {analysis && (
                    <div className="score-improvement">
                      <TrendingUp size={11} />
                      {getScoreLabel()}
                    </div>
                  )}
                </div>

                <div className="score-progress-bg">
                  <div
                    className="score-progress-fill"
                    style={{
                      width: `${Math.min(100, Math.max(0, score ?? 0))}%`,
                    }}
                  >
                    <span></span>
                  </div>
                </div>

                <div className="score-scale">
                  <span>Needs Work</span>
                  <span>Good</span>
                  <span>Excellent</span>
                </div>

                <div className="score-insight">
                  <div className="score-insight-icon">
                    <Lightbulb size={13} />
                  </div>

                  <p>
                    {analysis?.scoreExplanation ||
                      "Upload and analyze your resume to see your personalized AI score and insights."}
                  </p>
                </div>
              </div>

              {/* MISSING SKILLS */}
              <div className="resume-card skills-card">
                <div className="card-title-row">
                  <span className="icon-title-box purple-bg">
                    <Target size={15} />
                  </span>

                  <div>
                    <h3>Missing Skills</h3>
                    <span className="card-mini-label">
                      {analysis
                        ? `${missingSkills.length} opportunities detected`
                        : "Awaiting resume analysis"}
                    </span>
                  </div>
                </div>

                <p className="sub-hint-text">
                  Based on your target role:
                  <strong> {targetRole}</strong>
                </p>

                <div className="skill-intelligence-list">
                  {missingSkills.length > 0 ? (
                    missingSkills.map((skill, index) => (
                      <div
                        className={`skill-intelligence-item ${getPriorityClass(
                          skill.priority
                        )}`}
                        key={`${skill.name}-${index}`}
                        title={skill.reason || ""}
                      >
                        <div className="skill-intelligence-icon">
                          <Target size={13} />
                        </div>

                        <div className="skill-intelligence-content">
                          <strong>{skill.name}</strong>
                          <span>
                            {skill.priority || "Recommended"}
                            {skill.reason ? ` · ${skill.reason}` : ""}
                          </span>
                        </div>

                        <ChevronRight size={14} />
                      </div>
                    ))
                  ) : (
                    <p className="sub-hint-text">
                      {analysis
                        ? "No missing skills were returned by the analysis."
                        : "Your role-specific skill gaps will appear here after analysis."}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT STACK */}
            <div className="resume-right-stack">
              {/* CRITICAL WEAKNESSES */}
              <div className="resume-card weaknesses-card">
                <div className="card-header-with-action">
                  <div>
                    <div className="section-eyebrow danger">
                      <CircleAlert size={12} />
                      ATTENTION REQUIRED
                    </div>

                    <h3>Critical Weaknesses</h3>
                  </div>

                  <span className="issue-count">
                    {String(weaknesses.length).padStart(2, "0")} issues
                  </span>
                </div>

                {weaknesses.length > 0 ? (
                  weaknesses.map((weakness, index) => (
                    <div
                      className={`weakness-item ${
                        String(weakness.severity || "").toLowerCase() === "high"
                          ? "warning-bg"
                          : "info-bg"
                      }`}
                      key={`${weakness.title}-${index}`}
                    >
                      <div className="weakness-icon-top">
                        <div
                          className={`weakness-icon ${
                            String(weakness.severity || "").toLowerCase() ===
                            "high"
                              ? "danger-icon"
                              : "info-icon"
                          }`}
                        >
                          {String(weakness.severity || "").toLowerCase() ===
                          "high" ? (
                            <AlertTriangle size={15} />
                          ) : (
                            <ListChecks size={15} />
                          )}
                        </div>

                        <div>
                          <span>
                            {String(weakness.severity || "MEDIUM").toUpperCase()}{" "}
                            IMPACT
                          </span>
                          <strong>{weakness.title}</strong>
                        </div>
                      </div>

                      <p>
                        {weakness.description}
                        {weakness.suggestion
                          ? ` ${weakness.suggestion}`
                          : ""}
                      </p>

                      {index === 0 && (
                        <button
                          className="weakness-action"
                          onClick={() => {
                            setShowSummaryInput(true);
                            setError("");
                          }}
                          disabled={Boolean(actionLoading)}
                        >
                          <Wand2 size={12} />
                          Improve with AI
                        </button>
                      )}

                      {index === 1 && (
                        <button
                          className="weakness-action"
                          onClick={() => {
                            setShowBulletsInput(true);
                            setError("");
                          }}
                          disabled={Boolean(actionLoading)}
                        >
                          <Wand2 size={12} />
                          Generate Rewrite
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="sub-hint-text">
                    {analysis
                      ? "No weaknesses were returned."
                      : "Your resume weaknesses will appear here after analysis."}
                  </p>
                )}

                {showSummaryInput && (
                  <div style={{ marginTop: "12px" }}>
                    <textarea
                      value={summaryInput}
                      onChange={(e) => setSummaryInput(e.target.value)}
                      placeholder="Paste your existing professional summary..."
                      rows={4}
                      maxLength={12000}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        border: "1px solid #e5e0f0",
                        borderRadius: "9px",
                        font: "inherit",
                        fontSize: "12px",
                        resize: "vertical",
                      }}
                    />

                    <button
                      className="weakness-action"
                      disabled={Boolean(actionLoading)}
                      onClick={() =>
                        runImprovement(
                          "summary",
                          "improve-summary",
                          summaryInput
                        )
                      }
                    >
                      <Sparkles size={12} />
                      {actionLoading === "summary"
                        ? "Improving..."
                        : "Submit Summary"}
                    </button>

                    <button
                      className="weakness-action"
                      onClick={() => setShowSummaryInput(false)}
                      style={{ marginLeft: "12px" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {showBulletsInput && (
                  <div style={{ marginTop: "12px" }}>
                    <textarea
                      value={bulletsInput}
                      onChange={(e) => setBulletsInput(e.target.value)}
                      placeholder="Paste your existing experience or project bullets..."
                      rows={4}
                      maxLength={12000}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        border: "1px solid #e5e0f0",
                        borderRadius: "9px",
                        font: "inherit",
                        fontSize: "12px",
                        resize: "vertical",
                      }}
                    />

                    <button
                      className="weakness-action"
                      disabled={Boolean(actionLoading)}
                      onClick={() =>
                        runImprovement(
                          "bullets",
                          "rewrite-bullets",
                          bulletsInput
                        )
                      }
                    >
                      <Sparkles size={12} />
                      {actionLoading === "bullets"
                        ? "Rewriting..."
                        : "Rewrite Bullets"}
                    </button>

                    <button
                      className="weakness-action"
                      onClick={() => setShowBulletsInput(false)}
                      style={{ marginLeft: "12px" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* ACTIONABLE IMPROVEMENTS */}
              <div className="resume-card improvements-card">
                <div className="card-header-with-action">
                  <div>
                    <div className="section-eyebrow">
                      <Zap size={12} />
                      AI RECOMMENDATIONS
                    </div>

                    <h3>Actionable Improvements</h3>
                  </div>

                  <div className="ai-spark-badge">
                    <Sparkles size={12} />
                    AI
                  </div>
                </div>

                <div className="improvement-list">
                  {recommendations.length > 0 ? (
                    recommendations.map((item, index) => (
                      <div className="improvement-item" key={index}>
                        <div className="improvement-number">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="improvement-content">
                          <strong>{item.title}</strong>

                          <p>
                            {item.description}
                          </p>

                          {item.example && (
                            <p>
                              <b>Example:</b> {item.example}
                            </p>
                          )}

                          {index === 0 && (
                            <button
                              className="generate-link"
                              onClick={handleGenerateExamples}
                            >
                              <Sparkles size={12} />
                              Generate examples
                              <ArrowRight size={12} />
                            </button>
                          )}
                        </div>

                        <CheckCircle2
                          size={15}
                          className="improvement-check"
                        />
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="improvement-item">
                        <div className="improvement-number">01</div>

                        <div className="improvement-content">
                          <strong>
                            Recommendations will appear here
                          </strong>

                          <p>
                            Analyze your resume to get role-specific
                            suggestions and examples.
                          </p>
                        </div>

                        <CheckCircle2
                          size={15}
                          className="improvement-check"
                        />
                      </div>
                    </>
                  )}
                </div>

                <button
                  className="full-analysis-btn"
                  onClick={() => {
                    setShowPlanInput((previous) => !previous);
                    setError("");
                  }}
                  disabled={Boolean(actionLoading)}
                >
                  <Sparkles size={14} />
                  Generate Full AI Improvement Plan
                  <ArrowRight size={14} />
                </button>

                {showPlanInput && (
                  <div style={{ marginTop: "14px" }}>
                    <textarea
                      value={planInput}
                      onChange={(e) => setPlanInput(e.target.value)}
                      placeholder="Paste your resume text or project/experience details to create a personalized improvement plan..."
                      rows={5}
                      maxLength={12000}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        padding: "10px",
                        border: "1px solid #e5e0f0",
                        borderRadius: "9px",
                        font: "inherit",
                        fontSize: "12px",
                        resize: "vertical",
                      }}
                    />

                    <button
                      className="weakness-action"
                      disabled={Boolean(actionLoading)}
                      onClick={() =>
                        runImprovement(
                          "plan",
                          "improvement-plan",
                          planInput
                        )
                      }
                    >
                      <Sparkles size={12} />
                      {actionLoading === "plan"
                        ? "Generating plan..."
                        : "Generate Plan"}
                    </button>

                    <button
                      className="weakness-action"
                      onClick={() => setShowPlanInput(false)}
                      style={{ marginLeft: "12px" }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default resume;
