
import React, { useState } from "react";
import {
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  Brain,
  TrendingUp,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./register.css";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const Register = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // Frontend validation
    if (!normalizedName) {
      setError("Please enter your full name.");
      return;
    }

    if (normalizedName.length < 2) {
      setError("Name must contain at least 2 characters.");
      return;
    }

    if (!normalizedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: normalizedName,
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // Backend error handling
      if (!response.ok || data.success === false) {
        if (response.status === 409) {
          setError(
            data.message ||
              "This email is already registered. Please log in instead."
          );
        } else if (response.status === 400 || response.status === 422) {
          setError(
            data.message ||
              data.detail ||
              "Please check your registration details."
          );
        } else if (response.status === 429) {
          setError("Too many requests. Please try again later.");
        } else {
          setError(
            data.message ||
              data.detail ||
              `Registration failed (${response.status}). Please try again.`
          );
        }

        return;
      }

      // Registration success
      setSuccess("Account created successfully! Redirecting to login...");

      // Do not store a token unless the registration API actually returns one.
      // This project completes authentication through the login endpoint.
      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
            email: normalizedEmail,
          },
        });
      }, 800);
    } catch (err) {
      console.error("Register request failed:", err);

      setError(
        "Unable to connect to the backend. Make sure the server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    navigate("/login");
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

      <div className="register-right">
        <div className="register-card">
          <div className="register-top">
            <h1>Create Account</h1>
            <p>Begin your curated career journey today.</p>
          </div>

          <form className="register-form" onSubmit={handleRegister}>
            <div className="register-group">
              <label>Full Name</label>
              <div className="register-input">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </div>
            </div>

            <div className="register-group">
              <label>Work or Student Email</label>
              <div className="register-input">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@university.edu"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="register-group">
              <label>Password</label>
              <div className="register-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  minLength={6}
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
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <small
                style={{
                  fontSize: "9px",
                  color: "#9a94a7",
                  marginTop: "5px",
                  display: "block",
                }}
              >
                Minimum 6 characters
              </small>
            </div>

            <div className="register-group">
              <label>Confirm Password</label>
              <div className="register-input">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    padding: 0,
                  }}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            <div className="terms">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                required
              />

              <p>
                I agree to the{" "}
                <span>Terms of Service</span> and{" "}
                <span>Privacy Policy</span>.
              </p>
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
                  marginBottom: "10px",
                }}
              >
                {error}
              </div>
            )}

            {success && (
              <div
                role="status"
                style={{
                  color: "#18794e",
                  background: "#ecfdf3",
                  border: "1px solid #b7ebc6",
                  padding: "9px 11px",
                  borderRadius: "8px",
                  fontSize: "11px",
                  lineHeight: 1.5,
                  marginBottom: "10px",
                }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              className="register-btn"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Get Started"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="register-bottom">
            <p onClick={handleLogin} style={{ cursor: "pointer" }}>
              Already have an account?
              <span> Log in</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
