
import React, { useCallback, useEffect, useState } from "react";
import {
  Sparkles,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  Server,
  Cloud,
  Code,
  Target,
  Zap,
  BriefcaseBusiness,
  Database,
  CheckCircle2,
  Clock3,
  ChevronRight,
  BarChart3,
  BrainCircuit,
  Rocket,
  GraduationCap,
  RefreshCw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Roadmap.css";
import Navbar from "../Navbar/navbar";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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

const getErrorMessage = (data, fallback) =>
  data?.message || data?.detail?.message || data?.detail || fallback;

const getSkillIcon = (name = "") => {
  const value = name.toLowerCase();

  if (/database|mongo|sql|postgres|mysql/.test(value)) {
    return "database";
  }

  if (/backend|node|express|api|server/.test(value)) {
    return "server";
  }

  if (/deploy|cloud|hosting|aws|azure/.test(value)) {
    return "cloud";
  }

  if (/react|ai|machine learning|python|model/.test(value)) {
    return "brain";
  }

  return "code";
};

const getSkillDescription = (name = "") =>
  `Build practical knowledge and hands-on experience in ${name}.`;

const getSkillProgress = (status) => {
  if (status === "completed") return 100;
  if (status === "active") return 25;
  return 0;
};

const getSkillLevel = (progress) => {
  if (progress >= 80) return "Advanced";
  if (progress >= 50) return "Intermediate";
  if (progress > 0) return "Beginner";
  return "Needs Focus";
};

const formatHours = (hours = 0) => `${hours} hours`;

const getMilestoneIcon = (icon, status) => {
  if (status === "completed") {
    return <CheckCircle2 size={15} />;
  }

  switch (icon) {
    case "server":
      return <Server size={15} />;
    case "cloud":
      return <Cloud size={15} />;
    case "database":
      return <Database size={15} />;
    case "brain":
      return <BrainCircuit size={15} />;
    default:
      return <Code size={15} />;
  }
};

const Roadmap = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [milestones, setMilestones] = useState([]);
  const [skills, setSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSkill, setActiveSkill] = useState(null);
  const [savingSkillId, setSavingSkillId] = useState(null);
  const [youtubeLoading, setYoutubeLoading] = useState(null);
  const [youtubeError, setYoutubeError] = useState("");
  const [youtubeCache, setYoutubeCache] = useState({});

  // STEP 1: Fetch the saved profile from the backend.
  const loadRoadmap = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setProfile(null);
      setError("Please login first to view your career roadmap.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    try {
      // Fetch the profile first. If it doesn't exist,
      // we don't need to request analysis or roadmap.
      const profileResponse = await fetch(
        `${API_BASE_URL}/career/profile`,
        { headers }
      );

      const profileData = await profileResponse.json();

      if (profileResponse.status === 401) {
        throw new Error("Session expired. Please login again.");
      }

      if (
        profileResponse.status === 404 ||
        profileData?.success === false &&
          !profileData?.profile
      ) {
        setProfile(null);
        setAnalysis(null);
        setSkills([]);
        setMilestones([]);
        setError("");
        return;
      }

      if (!profileResponse.ok) {
        throw new Error(
          getErrorMessage(
            profileData,
            "Could not load the saved career profile."
          )
        );
      }

      const savedProfile = profileData?.profile;

      if (!savedProfile) {
        setProfile(null);
        setAnalysis(null);
        setSkills([]);
        setMilestones([]);
        return;
      }

      // STEP 2: Once a profile exists, fetch its analysis
      // and roadmap from the same authenticated user.
      const [analysisResponse, roadmapResponse] =
        await Promise.all([
          fetch(`${API_BASE_URL}/career/analysis`, { headers }),
          fetch(`${API_BASE_URL}/roadmap`, { headers }),
        ]);

      const [analysisData, roadmapData] = await Promise.all([
        analysisResponse.json(),
        roadmapResponse.json(),
      ]);

      if (
        analysisResponse.status === 401 ||
        roadmapResponse.status === 401
      ) {
        throw new Error("Session expired. Please login again.");
      }

      if (!analysisResponse.ok) {
        throw new Error(
          getErrorMessage(
            analysisData,
            "Could not load the career analysis."
          )
        );
      }

      if (!roadmapResponse.ok) {
        throw new Error(
          getErrorMessage(
            roadmapData,
            "Could not load the learning roadmap."
          )
        );
      }

      const careerAnalysis = analysisData?.analysis;
      const roadmap = roadmapData?.roadmap;

      if (!careerAnalysis || !roadmap) {
        throw new Error(
          "The backend response is missing analysis or roadmap data."
        );
      }

      // STEP 3: Save profile values dynamically.
      const timelineMonths = Number(
        savedProfile.timelineMonths ??
        roadmap.timelineMonths ??
        0
      );

      setProfile({
        degree: savedProfile.degree || roadmap.degree || "Not specified",
        field: savedProfile.field || roadmap.field || "Not specified",
        targetRole:
          savedProfile.targetRole ||
          roadmap.targetRole ||
          "Not specified",
        timelineMonths,
        timeline: timelineMonths
          ? `${timelineMonths} Months`
          : "Not specified",
      });

      setAnalysis(careerAnalysis);

      // STEP 4: Convert the backend skill response for the UI.
      const analysisSkills = Array.isArray(careerAnalysis.skills)
        ? careerAnalysis.skills
        : [];

      const mappedSkills = analysisSkills.map((skill, index) => ({
        id: skill.name,
        name: skill.name,
        status: skill.status || "pending",
        progress: getSkillProgress(skill.status),
        description:
          skill.description || getSkillDescription(skill.name),
        priority: skill.priority || "normal",
        icon: getSkillIcon(skill.name),
        estimatedHours: Number(skill.estimatedHours || 0),
        index,
      }));

      setSkills(mappedSkills);

      // STEP 5: Convert backend milestones for the timeline.
      const roadmapMilestones = Array.isArray(roadmap.milestones)
        ? roadmap.milestones
        : [];

      setMilestones(
        roadmapMilestones.map((item, index) => ({
          id: item.id || item.title || `milestone-${index}`,
          step: item.order ?? index + 1,
          title: item.title || item.skill || "Learning milestone",
          skill: item.title || item.skill || "Learning milestone",
          description:
            item.description ||
            getSkillDescription(item.title || item.skill),
          topics: Array.isArray(item.topics)
            ? item.topics
            : [item.title || item.skill].filter(Boolean),
          icon: getSkillIcon(item.title || item.skill),
          status: item.status || "pending",
          priority: item.priority || "normal",
          estimatedHours: Number(item.estimatedHours || 0),
        }))
      );
    } catch (err) {
      console.error("Roadmap API error:", err);
      setError(err.message || "Unable to load your roadmap.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRoadmap();
  }, [loadRoadmap]);

  // STEP 6: Calculate all counters from fetched data.
  const completedMilestones = milestones.filter(
    (item) => item.status === "completed"
  ).length;

  const roadmapProgress = milestones.length
    ? Math.round(
        (completedMilestones / milestones.length) * 100
      )
    : 0;

  const totalHours = Number(
    analysis?.totalEstimatedHours ?? 0
  );

  const remainingHours = Number(
    analysis?.remainingEstimatedHours ?? 0
  );

  const readiness = Number(
    analysis?.readinessPercentage ?? 0
  );

  const matchedSkillCount = Number(
    analysis?.knownSkillCount ?? 0
  );

  const missingSkillCount = Number(
    analysis?.missingSkillCount ?? 0
  );

  const missingSkills = skills.filter(
    (skill) => skill.status !== "completed"
  );

  const firstMissingSkill = missingSkills[0];

  // STEP 7: Save a progress change to the backend.
  const saveSkillStatus = async (skillName, progress) => {
    const token = getToken();

    if (!token) {
      setError("Please login before updating skill progress.");
      return;
    }

    const status =
      progress >= 100
        ? "completed"
        : progress > 0
          ? "active"
          : "pending";

    setSavingSkillId(skillName);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/career/skills/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            skill: skillName,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "Could not save skill progress.")
        );
      }

      await loadRoadmap();
      setActiveSkill(null);
    } catch (err) {
      console.error("Skill progress error:", err);
      setError(err.message || "Could not save skill progress.");
    } finally {
      setSavingSkillId(null);
    }
  };

  const updateSkillProgress = (id, progress) => {
    setSkills((previous) =>
      previous.map((skill) =>
        skill.id === id ? { ...skill, progress } : skill
      )
    );
  };

  // STEP 8: Load learning videos only when the user clicks.
  const handleYouTubeSearch = async (milestone) => {
    const query = `${milestone.skill || milestone.title} tutorial`;
    const cacheKey = query.toLowerCase();

    setYoutubeError("");

    const cachedVideos = youtubeCache[cacheKey];

    if (cachedVideos?.length) {
      window.open(
        cachedVideos[0].url,
        "_blank",
        "noopener,noreferrer"
      );
      return;
    }

    const token = getToken();

    if (!token) {
      setYoutubeError("Please login to search for learning videos.");
      return;
    }

    setYoutubeLoading(milestone.id);

    try {
      const response = await fetch(
        `${API_BASE_URL}/youtube/search?q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          getErrorMessage(data, "YouTube search failed.")
        );
      }

      const videos = (data.videos || [])
        .filter((video) => video.url || video.videoId)
        .map((video) => ({
          ...video,
          url:
            video.url ||
            `https://www.youtube.com/watch?v=${video.videoId}`,
        }));

      setYoutubeCache((previous) => ({
        ...previous,
        [cacheKey]: videos,
      }));

      if (videos.length > 0) {
        window.open(
          videos[0].url,
          "_blank",
          "noopener,noreferrer"
        );
      } else {
        setYoutubeError("No learning videos were found.");
      }
    } catch (err) {
      console.error("YouTube API error:", err);
      setYoutubeError(err.message || "Could not load learning videos.");
    } finally {
      setYoutubeLoading(null);
    }
  };

  const handleViewSkills = () => navigate("/skills");

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="roadmap-container">
          <section className="trajectory-header">
            <h1>Loading your personalized roadmap...</h1>
            <p>Fetching your saved profile and career analysis.</p>
          </section>
        </div>
      </>
    );
  }

  // Authentication/API error state
  if (error && !profile) {
    return (
      <>
        <Navbar />
        <div className="roadmap-container">
          <section className="trajectory-header">
            <h1>Unable to load roadmap</h1>
            <p role="alert">{error}</p>

            {!getToken() ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
            ) : (
              <button type="button" onClick={loadRoadmap}>
                <RefreshCw size={14} /> Retry
              </button>
            )}
          </section>
        </div>
      </>
    );
  }

  // Empty state: profile must be saved through Postman or the app.
  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="roadmap-container">
          <section className="trajectory-header">
            <div className="trajectory-label">
              <span className="label-dot" />
              AI CAREER PLANNER
            </div>

            <h1>No career profile found</h1>
            <p>
              Save a career profile for your logged-in user through
              Postman, then reload this page.
            </p>

            <button
              type="button"
              onClick={() => navigate("/options")}
            >
              Create Career Profile
            </button>

            <button type="button" onClick={loadRoadmap}>
              <RefreshCw size={14} /> Check Again
            </button>
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="roadmap-container">
        {/* TOP BAR */}
        <div className="roadmap-topbar">
          <div className="roadmap-heading">
            <div className="roadmap-heading-icon">
              <Target size={19} />
            </div>

            <div>
              <span className="roadmap-eyebrow">
                AI CAREER PLANNER
              </span>
              <h2>Strategic Roadmap</h2>
              <p>
                Your personalized path from current skills to your
                target role.
              </p>
            </div>
          </div>

          <div className="roadmap-header-actions">
            <div className="roadmap-ai-status">
              <span className="status-dot" />
              Personalized Roadmap
            </div>

            
          </div>
        </div>

        {error && <p role="alert">{error}</p>}
        {youtubeError && <p role="status">{youtubeError}</p>}

        <div className="roadmap-content">
          {/* LEFT COLUMN */}
          <div className="roadmap-left-col">
            {/* CAREER TRAJECTORY */}
            <section className="trajectory-header">
              <div className="trajectory-label">
                <span className="label-dot" />
                YOUR CAREER TRAJECTORY
              </div>

              <h1>
                From <span>{profile.field}</span> to
                <strong> {profile.targetRole}.</strong>
              </h1>

              <p>
                Your {profile.degree} background, target role and{" "}
                {profile.timeline} preparation timeline shape this
                learning roadmap.
              </p>

              <div className="trajectory-progress">
                <div className="trajectory-progress-info">
                  <span>Overall roadmap progress</span>
                  <strong>{roadmapProgress}%</strong>
                </div>

                <div className="trajectory-progress-bar">
                  <div
                    className="trajectory-progress-fill"
                    style={{ width: `${roadmapProgress}%` }}
                  />
                </div>

                <div className="trajectory-progress-footer">
                  <span>
                    <CheckCircle2 size={13} />
                    {completedMilestones} of {milestones.length} milestones
                    completed
                  </span>
                  <span>
                    <Clock3 size={13} />
                    {profile.timeline}
                  </span>
                </div>
              </div>
            </section>

            {/* DYNAMIC STATS */}
            <div className="roadmap-stats-grid">
              <div className="roadmap-stat-card">
                <div className="stat-icon purple">
                  <BriefcaseBusiness size={17} />
                </div>
                <div>
                  <span>Education</span>
                  <strong>{profile.degree}</strong>
                </div>
              </div>

              <div className="roadmap-stat-card">
                <div className="stat-icon blue">
                  <Target size={17} />
                </div>
                <div>
                  <span>Target Role</span>
                  <strong
                    style={{
                      maxWidth: "100%",
                      whiteSpace: "normal",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {profile.targetRole}
                  </strong>
                </div>
              </div>

              <div className="roadmap-stat-card">
                <div className="stat-icon green">
                  <TrendingUp size={17} />
                </div>
                <div>
                  <span>Skill Readiness</span>
                  <strong>{readiness}%</strong>
                </div>
              </div>

              <div className="roadmap-stat-card">
                <div className="stat-icon orange">
                  <Rocket size={17} />
                </div>
                <div>
                  <span>Estimated Hours</span>
                  <strong>{totalHours} hours</strong>
                </div>
              </div>
            </div>

            {/* CAREER WAYPOINTS */}
            <section className="waypoint-card">
              <div className="section-card-header">
                <div className="section-title-group">
                  <div className="section-icon">
                    <Layers size={17} />
                  </div>
                  <div>
                    <h3>Career Waypoints</h3>
                    <p>Your progression milestones</p>
                  </div>
                </div>

                <span className="track-badge">
                  <Sparkles size={12} />
                  CAREER TRACK
                </span>
              </div>

              <div className="timeline-tree">
                {milestones.map((milestone, index) => {
                  const isActive = milestone.status === "active";
                  const isCompleted =
                    milestone.status === "completed";

                  return (
                    <div
                      className={`timeline-item ${
                        isActive ? "active-item" : ""
                      }`}
                      key={milestone.id}
                    >
                      {index < milestones.length - 1 && (
                        <div className="timeline-line" />
                      )}

                      <div
                        className={`timeline-node ${
                          isActive || isCompleted ? "active-node" : ""
                        }`}
                      >
                        {getMilestoneIcon(
                          milestone.icon,
                          milestone.status
                        )}
                      </div>

                      <div className="timeline-info">
                        <div className="timeline-item-top">
                          <div>
                            <span className="timeline-stage">
                              STEP {milestone.step}
                            </span>
                            <h4>{milestone.title}</h4>
                          </div>

                          <span
                            className={
                              isActive || isCompleted
                                ? "badge-active"
                                : "badge-est"
                            }
                          >
                            {milestone.status.toUpperCase()}
                          </span>
                        </div>

                        <p>{milestone.description}</p>

                        <div className="timeline-tags">
                          <span>
                            <Code size={11} />
                            {milestone.skill}
                          </span>

                          <span>
                            <Clock3 size={11} />
                            {formatHours(milestone.estimatedHours)}
                          </span>

                          {milestone.topics.slice(0, 4).map((topic) => (
                            <span key={topic}>
                              <Layers size={11} />
                              {topic}
                            </span>
                          ))}
                        </div>

                        <div>
                          <button
                            type="button"
                            className="roadmap-milestone-action"
                            disabled={
                              youtubeLoading === milestone.id
                            }
                            onClick={() =>
                              handleYouTubeSearch(milestone)
                            }
                          >
                            {youtubeLoading === milestone.id
                              ? "Loading..."
                              : "YouTube"}
                            <ChevronRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {milestones.length === 0 && (
                  <p>No milestones were returned by the backend.</p>
                )}
              </div>
            </section>

            {/* SKILL GAP */}
            <section className="gap-section">
              <div className="gap-header">
                <div>
                  <div className="section-eyebrow">
                    <Zap size={13} />
                    SKILL INTELLIGENCE
                  </div>
                  <h3>Bridging the Gap</h3>
                  <p>The skills you should focus on next.</p>
                </div>

                <button
                  type="button"
                  className="view-skills-btn"
                  onClick={handleViewSkills}
                >
                  View all skills
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="gap-grid">
                {skills.map((skill, index) => (
                  <div className="gap-sub-card" key={skill.id}>
                    <div className="skill-card-top">
                      <div
                        className={`skill-icon ${
                          index % 4 === 0
                            ? "purple"
                            : index % 4 === 1
                              ? "orange"
                              : index % 4 === 2
                                ? "red"
                                : "green"
                        }`}
                      >
                        {skill.icon === "server" ? (
                          <Server size={16} />
                        ) : skill.icon === "database" ? (
                          <Database size={16} />
                        ) : skill.icon === "brain" ? (
                          <BrainCircuit size={16} />
                        ) : skill.icon === "cloud" ? (
                          <Cloud size={16} />
                        ) : (
                          <Code size={16} />
                        )}
                      </div>

                      <span className="progress-num">
                        {skill.progress}%
                      </span>
                    </div>

                    <strong>{skill.name}</strong>
                    <p>{skill.description}</p>

                    <div className="mini-progress-bg">
                      <div
                        className={`mini-progress-fill ${
                          index % 4 === 1
                            ? "orange"
                            : index % 4 === 2
                              ? "red"
                              : index % 4 === 3
                                ? "green"
                                : ""
                        }`}
                        style={{ width: `${skill.progress}%` }}
                      />
                    </div>

                    <div className="skill-footer">
                      <span>{getSkillLevel(skill.progress)}</span>
                      <span>{skill.progress} / 100</span>
                    </div>

                    <button
                      type="button"
                      className="roadmap-skill-action"
                      onClick={() =>
                        setActiveSkill(
                          activeSkill === skill.id ? null : skill.id
                        )
                      }
                    >
                      {activeSkill === skill.id
                        ? "Close progress editor"
                        : "Update progress"}
                    </button>

                    {activeSkill === skill.id && (
                      <div className="roadmap-progress-editor">
                        <label htmlFor={`skill-${skill.index}`}>
                          Practice progress
                        </label>

                        <input
                          id={`skill-${skill.index}`}
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={skill.progress}
                          onChange={(event) =>
                            updateSkillProgress(
                              skill.id,
                              Number(event.target.value)
                            )
                          }
                        />

                        <span>{skill.progress}% complete</span>

                        <button
                          type="button"
                          className="roadmap-skill-action"
                          disabled={savingSkillId === skill.id}
                          onClick={() =>
                            saveSkillStatus(
                              skill.name,
                              skill.progress
                            )
                          }
                        >
                          {savingSkillId === skill.id
                            ? "Saving..."
                            : "Save progress"}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {skills.length === 0 && (
                  <p>No skills were returned by the backend analysis.</p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="roadmap-right-col">
            <div className="market-card">
              <div className="market-card-header">
                <div className="market-icon">
                  <TrendingUp size={17} />
                </div>
                <div>
                  <span>CAREER OUTLOOK</span>
                  <h4>Market Demand</h4>
                </div>
              </div>

              <div className="market-stat">
                <strong>{profile.targetRole}</strong>
                <span>Career opportunities</span>
              </div>

              <div className="market-chart">
                {[30, 42, 48, 62, 78, 94].map((height, index) => (
                  <div
                    key={index}
                    className={`chart-bar ${
                      index === 5 ? "active" : ""
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              <p>
                Build the skills and projects required for your{" "}
                {profile.targetRole} learning journey.
              </p>
            </div>

            <div className="side-card">
              <div className="side-card-title">
                <div className="side-title-icon">
                  <BarChart3 size={15} />
                </div>
                <span>Skill Gap Overview</span>
              </div>

              <div className="projection-row">
                <div>
                  <small>MATCHED SKILLS</small>
                  <h3>{matchedSkillCount}</h3>
                </div>

                <div className="projection-arrow">
                  <ArrowRight size={17} />
                </div>

                <div>
                  <small>MISSING SKILLS</small>
                  <h3 className="target-val">{missingSkillCount}</h3>
                </div>
              </div>

              <div className="projection-growth">
                <TrendingUp size={13} />
                {readiness}% skill readiness
              </div>
            </div>

            <div className="side-card goal-card">
              <div className="goal-row-top">
                <div className="goal-icon-box">
                  <Award size={19} />
                </div>
                <div>
                  <span className="rec-goal-label">
                    LEARNING RECOMMENDATION
                  </span>
                  <h4>{profile.targetRole}</h4>
                </div>
              </div>

              <div className="goal-meta">
                <span>
                  <GraduationCap size={12} />
                  Online Learning
                </span>
                <span>
                  <Clock3 size={12} />
                  Self-paced
                </span>
              </div>

              <p>
                Estimated remaining learning time: {remainingHours} hours.
              </p>

              <button
                type="button"
                className="exam-link"
                onClick={handleViewSkills}
              >
                EXPLORE SKILLS
                <ArrowRight size={13} />
              </button>
            </div>

            <div className="side-card immediate-card">
              <div className="future-vision-status">
                <span className="future-dot" />
                PERSONALIZED SUGGESTION
              </div>

              <div className="immediate-top">
                <div className="focus-icon">
                  <Zap size={17} />
                </div>
                <span className="immediate-label">
                  IMMEDIATE FOCUS
                </span>
              </div>

              <h3>
                {firstMissingSkill
                  ? `Focus on ${firstMissingSkill.name}`
                  : "Maintain your skills"}
              </h3>

              <p>
                {firstMissingSkill
                  ? `Strengthen ${firstMissingSkill.name} to reduce the remaining skill gap for ${profile.targetRole}.`
                  : "Continue practicing and building projects."}
              </p>

              <div className="focus-checks">
                {missingSkills.slice(0, 3).map((skill) => (
                  <span key={skill.id}>
                    <CheckCircle2 size={13} />
                    {skill.name}
                  </span>
                ))}
              </div>

              <button
                type="button"
                className="curated-course-btn"
                onClick={handleViewSkills}
              >
                VIEW SKILL GAP
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="ai-insight-card">
              <div className="ai-insight-icon">
                <Sparkles size={17} />
              </div>
              <div>
                <span>CAREER INSIGHT</span>
                <p>
                  Your {profile.degree} background in {profile.field} is
                  the foundation for your {profile.targetRole} learning
                  journey.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Roadmap;
