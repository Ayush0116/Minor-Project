
import React, { useState } from "react";
import {
  Sparkles,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Brain,
  TrendingUp,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./login.css";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data.success === false) {
        if (response.status === 401) {
          setError("Invalid email or password.");
        } else if (response.status === 404) {
          setError("Account or login endpoint not found. Check your backend.");
        } else if (response.status === 429) {
          setError("Too many attempts. Please try again later.");
        } else {
          setError(
            data.message ||
            data.detail ||
            `Login failed (${response.status}). Please try again.`
          );
        }
        return;
      }

      // Supports common backend response formats:
      // { token, user }
      // { data: { token, user } }
      // { success: true, data: { token, user } }
      const payload = data.data ?? data;
      const token =
        payload.token ??
        payload.accessToken ??
        data.token ??
        data.accessToken;

      const user = payload.user ?? data.user ?? null;

      if (typeof token !== "string" || !token.trim()) {
        console.error("Login response is missing a token:", {
          ...data,
          token: undefined,
          accessToken: undefined,
        });

        setError(
          "Backend did not return an authentication token. Check the /auth/login response."
        );
        return;
      }

      // Clear previous authentication data from both storage locations.
      const storageKeys = ["token", "authToken", "jwt", "user"];

      storageKeys.forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });

      // Keep the same token key used by protected API requests.
      const storage = rememberMe ? localStorage : sessionStorage;

      storage.setItem("token", token.trim());

      if (user) {
        storage.setItem("user", JSON.stringify(user));
      }

      setPassword("");

      // Navigate only after receiving and saving the JWT.
      navigate("/dashboard", { replace: true });
    } catch (err) {
  console.error("Login request failed:", err);

  setError(
    `Backend connection failed. API URL: ${API_URL || "MISSING"}. Please check the deployed backend and network connection.`
  );
} finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <div className="grid-overlay"></div>
        <div className="blur blur-1"></div>
        <div className="blur blur-2"></div>

        <div className="logo">
          <div className="logo-icon">
            <Sparkles size={22} />
          </div>
          <div>
            <h2>Curator AI</h2>
            <p>Career intelligence, personalized.</p>
          </div>
        </div>

        <div className="ai-badge">
          <span></span>
          Powered by adaptive career AI
        </div>

        <div className="hero-content">
          <h1>
            Discover the career
            built for who you’re becoming.
          </h1>
        </div>

        <div className="floating-cards">
          <div className="info-card">
            <div className="card-top">
              <Target size={18} />
              <span>AI CAREER MATCH</span>
            </div>
            <h3>92%</h3>
            <p>Personalized role matching</p>
            <div className="progress">
              <div className="progress-fill"></div>
            </div>
          </div>

          <div className="info-card small">
            <div className="card-top">
              <TrendingUp size={18} />
              <span>FUTURE READINESS</span>
            </div>
            <h3>AI</h3>
            <p>Data-driven career insights</p>
          </div>

          <div className="info-card">
            <div className="card-top">
              <Brain size={18} />
              <span>RECOMMENDED SKILLS</span>
            </div>
            <h3>Skill Gap</h3>
            <p>Personalized learning roadmap</p>
          </div>

          <div className="info-card small">
            <div className="card-top">
              <TrendingUp size={18} />
              <span>CAREER INSIGHTS</span>
            </div>
            <h3>Smart</h3>
            <p>AI-powered recommendations</p>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="welcome-badge">
            <Sparkles size={15} />
            Welcome back
          </div>

          <h1>Continue your career journey</h1>

          <p className="subtitle">
            Pick up where your AI mentor left off —
            new insights are waiting.
          </p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Work or student email</label>
              <div className="input-box">
                <Mail size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-box">
                <Lock size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Keep me signed in on this device</span>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  color: "#c94b68",
                  background: "#fff1f4",
                  border: "1px solid #f4d1da",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  marginBottom: "12px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in to Curator AI"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
