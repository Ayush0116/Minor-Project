
import React, { useState } from "react";
import "./landingpage.css";
import { Sparkles, LineChart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL || "http://127.0.0.1:8000";

const CHATBOT_API_URL = `${AI_API_BASE_URL}/api/ai/chatbot`;

const LandingPage = () => {
  const navigate = useNavigate();

  const [dreamJob, setDreamJob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    const message = dreamJob.trim();

    if (!message) {
      setError("Please enter your dream job first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data.detail || data.message || "Unable to connect to the AI chatbot."
        );
      }

      // Save the question and response for the chatbot page.
      sessionStorage.setItem("careerChatMessage", message);
      sessionStorage.setItem(
        "careerChatResponse",
        JSON.stringify(data)
      );

      // Open your existing chatbot page.
      navigate("/chatbot", {
        state: {
          initialMessage: message,
          initialResponse: data,
        },
      });
    } catch (err) {
      console.error("Career analysis error:", err);
      setError(
        err.message ||
          "AI service se connect nahi ho pa raha. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-left">
          <a href="#features">Features</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#analytics">Analytics</a>
          <a href="#pricing">Pricing</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="hero">
        <div className="left-heading-1">
          <div className="left-heading-2">
            <div className="left-heading-3">
              <p className="left-heading-title">MARKET DEMAND</p>
              <p className="left-heading-subtitle">
                Current role outlook
              </p>
            </div>

            <div className="left-heading-icon-wrap">
              <LineChart
                size={16}
                className="left-heading-icon"
              />
            </div>
          </div>

          <div className="left-heading-stats">
            <span className="left-heading-value">+12%</span>
            <span className="left-heading-label">
              projected growth
            </span>
          </div>

          <div className="left-heading-bar">
            <div className="left-heading-fill"></div>
          </div>

          <div className="left-heading-footer">
            <span>Demand outlook</span>
            <span>High</span>
          </div>
        </div>

        <div className="progress-circle float">
          <div className="inner">
            <span>75%</span>
            <p>READINESS</p>
          </div>
        </div>

        <p className="tag">THE OBSIDIAN LENS</p>

        <h1>
          Design Your Career with <br />
          <span>AI Intelligence</span>
        </h1>

        <p className="desc">
          The next-gen platform for professional growth and career
          mastery. Navigate the
          <br />
          complexity of modern work with predictive insights.
        </p>

        {/* AI Career Input */}
        <div className="search-box">
          <form
            className="search-inner"
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze();
            }}
          >
            <Sparkles
              className="icon"
              strokeWidth={1}
              size={18}
            />

            <input
              type="text"
              placeholder="Tell me your dream job..."
              value={dreamJob}
              onChange={(e) => setDreamJob(e.target.value)}
              disabled={loading}
              aria-label="Your dream job"
            />

            <button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </form>

          {error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="buttons">
          <button
            className="primary"
            onClick={() => navigate("/register")}
          >
            Start Your Journey
          </button>
        </div>

        <div className="next-action float">
          <div className="icon-box">
            <Zap size={18} strokeWidth={2} />
          </div>

          <div>
            <p className="label">NEXT ACTION</p>
            <p className="text">Update core portfolio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
