
import React, { useEffect, useMemo, useState } from "react";
import "./options.css";
import Navbar from "../Navbar/navbar";
import { useNavigate } from "react-router-dom";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const TIMELINES = [
  { label: "Less than 1 Month", value: 1 },
  { label: "1–2 Months", value: 2 },
  { label: "3–4 Months", value: 4 },
  { label: "5–6 Months", value: 6 },
  { label: "6+ Months", value: 7 },
];

const getToken = () =>
  localStorage.getItem("token") ||
  sessionStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  sessionStorage.getItem("authToken") ||
  localStorage.getItem("jwt") ||
  sessionStorage.getItem("jwt");

const getErrorMessage = (result, fallback) => {
  if (typeof result?.message === "string") return result.message;
  if (typeof result?.detail?.message === "string") {
    return result.detail.message;
  }
  if (typeof result?.detail === "string") return result.detail;
  return fallback;
};

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);

  let result;

  try {
    result = await response.json();
  } catch {
    throw new Error(
      `Server returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok || result?.success === false) {
    throw new Error(
      getErrorMessage(result, `Request failed (${response.status}).`)
    );
  }

  return result;
}

const Options = () => {
  const navigate = useNavigate();

  const [qualifications, setQualifications] = useState([]);
  const [fields, setFields] = useState([]);
  const [roles, setRoles] = useState([]);
  const [skills, setSkills] = useState([]);

  const [selectedDegree, setSelectedDegree] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [timeline, setTimeline] = useState("");
  const [careerGoal, setCareerGoal] = useState("");

  const [loadingQualifications, setLoadingQualifications] =
    useState(false);
  const [loadingFields, setLoadingFields] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Selected catalog objects
  const selectedQualification = useMemo(
    () => qualifications.find((item) => item._id === selectedDegree),
    [qualifications, selectedDegree]
  );

  const selectedField = useMemo(
    () => fields.find((item) => item._id === selectedBranch),
    [fields, selectedBranch]
  );

  const selectedRoleObject = useMemo(
    () => roles.find((role) => role._id === targetRole),
    [roles, targetRole]
  );

  // -----------------------------------------------------
  // 1. Load qualifications
  // GET /api/qualifications
  // -----------------------------------------------------
  useEffect(() => {
    const controller = new AbortController();

    const loadQualifications = async () => {
      setLoadingQualifications(true);

      try {
        const result = await fetchJSON(
          `${API_BASE_URL}/qualifications`,
          { signal: controller.signal }
        );

        setQualifications(
          Array.isArray(result.data) ? result.data : []
        );
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Qualifications API error:", error);
          setErrorMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingQualifications(false);
        }
      }
    };

    loadQualifications();

    return () => controller.abort();
  }, []);

  // -----------------------------------------------------
  // 2. Load fields for selected qualification
  // GET /api/fields?qualification=ID
  // -----------------------------------------------------
  useEffect(() => {
    if (!selectedDegree) {
      setFields([]);
      return;
    }

    const controller = new AbortController();

    const loadFields = async () => {
      setLoadingFields(true);

      try {
        const result = await fetchJSON(
          `${API_BASE_URL}/fields?qualification=${encodeURIComponent(
            selectedDegree
          )}`,
          { signal: controller.signal }
        );

        setFields(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Fields API error:", error);
          setFields([]);
          setErrorMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingFields(false);
        }
      }
    };

    loadFields();

    return () => controller.abort();
  }, [selectedDegree]);

  // -----------------------------------------------------
  // 3. Load target roles for selected field
  // GET /api/roles?field=ID
  // -----------------------------------------------------
  useEffect(() => {
    if (!selectedBranch) {
      setRoles([]);
      return;
    }

    const controller = new AbortController();

    const loadRoles = async () => {
      setLoadingRoles(true);

      try {
        const result = await fetchJSON(
          `${API_BASE_URL}/roles?field=${encodeURIComponent(
            selectedBranch
          )}`,
          { signal: controller.signal }
        );

        setRoles(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Roles API error:", error);
          setRoles([]);
          setErrorMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingRoles(false);
        }
      }
    };

    loadRoles();

    return () => controller.abort();
  }, [selectedBranch]);

  // -----------------------------------------------------
  // 4. Load skills for selected role
  // First use role.skills; if empty, load all catalog skills.
  // GET /api/skills is the fallback endpoint.
  // -----------------------------------------------------
  useEffect(() => {
    if (!targetRole || !selectedRoleObject) {
      setSkills([]);
      setSelectedSkills([]);
      return;
    }

    const controller = new AbortController();

    const loadRoleSkills = async () => {
      setLoadingSkills(true);
      setSkills([]);
      setSelectedSkills([]);

      try {
        const embeddedSkills = Array.isArray(
          selectedRoleObject.skills
        )
          ? selectedRoleObject.skills
              .map((item) => {
                // API may return a populated skill object
                // or an unpopulated MongoDB reference.
                const skill =
                  item?.skill && typeof item.skill === "object"
                    ? item.skill
                    : item;

                if (!skill?._id || !skill?.name) return null;

                return {
                  _id: skill._id,
                  name: skill.name,
                  category: skill.category || "",
                  estimatedHours: item?.estimatedHours || 0,
                };
              })
              .filter(Boolean)
          : [];

        if (embeddedSkills.length > 0) {
          setSkills(embeddedSkills);
          return;
        }

        // Fallback: show the skills catalog when this role
        // has no linked skills in MongoDB.
        const result = await fetchJSON(
          `${API_BASE_URL}/skills`,
          { signal: controller.signal }
        );

        const catalogSkills = Array.isArray(result.data)
          ? result.data.filter(
              (skill) => skill?._id && skill?.name
            )
          : [];

        setSkills(catalogSkills);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Role skills API error:", error);
          setSkills([]);
          setErrorMessage(error.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSkills(false);
        }
      }
    };

    loadRoleSkills();

    return () => controller.abort();
  }, [targetRole, selectedRoleObject]);

  // -----------------------------------------------------
  // 5. Handle qualification change
  // -----------------------------------------------------
  const handleDegreeChange = (event) => {
    setSelectedDegree(event.target.value);
    setSelectedBranch("");
    setTargetRole("");
    setSelectedSkills([]);
    setFields([]);
    setRoles([]);
    setSkills([]);
    setErrorMessage("");
  };

  // -----------------------------------------------------
  // 6. Handle field change
  // -----------------------------------------------------
  const handleBranchChange = (event) => {
    setSelectedBranch(event.target.value);
    setTargetRole("");
    setSelectedSkills([]);
    setRoles([]);
    setSkills([]);
    setErrorMessage("");
  };

  // -----------------------------------------------------
  // 7. Handle target role change
  // -----------------------------------------------------
  const handleRoleChange = (event) => {
    setTargetRole(event.target.value);
    setSelectedSkills([]);
    setSkills([]);
    setErrorMessage("");
  };

  // -----------------------------------------------------
  // 8. Toggle known skills
  // -----------------------------------------------------
  const toggleSkill = (skillId) => {
    setSelectedSkills((previous) =>
      previous.includes(skillId)
        ? previous.filter((id) => id !== skillId)
        : [...previous, skillId]
    );
  };

  // -----------------------------------------------------
  // 9. Save career profile
  // PUT /api/career/profile
  // -----------------------------------------------------
  const handleContinue = async () => {
    setErrorMessage("");

    if (!selectedQualification) {
      setErrorMessage("Please select your qualification.");
      return;
    }

    if (!selectedField) {
      setErrorMessage("Please select your field of study.");
      return;
    }

    if (!selectedRoleObject) {
      setErrorMessage("Please select your target role.");
      return;
    }

    if (!timeline) {
      setErrorMessage("Please select your preparation timeline.");
      return;
    }

    const token = getToken();

    if (!token) {
      setErrorMessage(
        "Authentication token not found. Please log in again."
      );
      return;
    }

    const selectedSkillNames = skills
      .filter((skill) => selectedSkills.includes(skill._id))
      .map((skill) => skill.name);

    if (selectedSkillNames.length !== selectedSkills.length) {
      setErrorMessage(
        "Some selected skills could not be resolved. Please select them again."
      );
      return;
    }

    const profileData = {
      degree: selectedQualification.name,
      field: selectedField.name,
      targetRole: selectedRoleObject.name,
      timelineMonths: Number(timeline),
      knownSkills: selectedSkillNames,
    };

    try {
      setSavingProfile(true);

      const result = await fetchJSON(
        `${API_BASE_URL}/career/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        }
      );

      const savedProfile = result.profile || result.data;

      if (savedProfile) {
        localStorage.setItem(
          "careerProfileBackend",
          JSON.stringify(savedProfile)
        );
      }

      localStorage.setItem(
        "careerProfile",
        JSON.stringify({
          degree: selectedQualification.name,
          branch: selectedField.name,
          selectedSkills: selectedSkillNames,
          targetRole: selectedRoleObject.name,
          timeline: Number(timeline),
          careerGoal: careerGoal.trim(),
        })
      );

      navigate("/roadmap");
    } catch (error) {
      console.error("Career profile save error:", error);
      setErrorMessage(
        error.message || "Unable to save career profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="profile-container">
        <header className="profile-header">
          <div className="header-content">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              CAREER PROFILE
            </div>

            <h1>Design Your Future</h1>

            <p>
              Refine your professional narrative. Curator AI uses this
              context to tailor opportunities specifically for you.
            </p>
          </div>

          <div className="profile-status">
            <span className="status-check">✓</span>
            Profile setup
          </div>
        </header>

        <div className="form-card">
          {/* ACADEMIC FOUNDATION */}
          <div className="form-section">
            <div className="section-heading">
              <div className="section-icon">🎓</div>
              <div>
                <h3>Academic Foundation</h3>
                <p>
                  Tell us about your educational background.
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Highest Qualification</label>

                <div className="select-wrapper">
                  <select
                    value={selectedDegree}
                    onChange={handleDegreeChange}
                    disabled={loadingQualifications}
                  >
                    <option value="">
                      {loadingQualifications
                        ? "Loading qualifications..."
                        : "Select your degree"}
                    </option>

                    {qualifications.map((qualification) => (
                      <option
                        key={qualification._id}
                        value={qualification._id}
                      >
                        {qualification.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Field of Study</label>

                <div className="select-wrapper">
                  <select
                    value={selectedBranch}
                    onChange={handleBranchChange}
                    disabled={!selectedDegree || loadingFields}
                  >
                    <option value="">
                      {!selectedDegree
                        ? "First select a degree"
                        : loadingFields
                        ? "Loading fields..."
                        : "Select your field"}
                    </option>

                    {fields.map((field) => (
                      <option key={field._id} value={field._id}>
                        {field.name}
                        {field.code ? ` (${field.code})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="divider"></div>

          {/* CAREER OBJECTIVE */}
          <div className="form-section">
            <div className="section-heading">
              <div className="section-icon blue">🎯</div>

              <div>
                <h3>Career Objective</h3>
                <p>
                  Select your target role and preparation timeline so
                  Curator AI can build a focused career plan.
                </p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Target Role</label>

                <div className="select-wrapper">
                  <select
                    value={targetRole}
                    onChange={handleRoleChange}
                    disabled={!selectedBranch || loadingRoles}
                  >
                    <option value="">
                      {!selectedBranch
                        ? "First select your field"
                        : loadingRoles
                        ? "Loading roles..."
                        : "Choose your target role"}
                    </option>

                    {roles.map((role) => (
                      <option key={role._id} value={role._id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Preparation Timeline</label>

                <div className="select-wrapper">
                  <select
                    value={timeline}
                    onChange={(event) => {
                      setTimeline(event.target.value);
                      setErrorMessage("");
                    }}
                  >
                    <option value="">Select your timeline</option>

                    {TIMELINES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="narrative-box">
              <div className="narrative-header">
                <div className="narrative-icon">✨</div>

                <div>
                  <strong>Tell us about your career goal</strong>
                  <p>
                    Share your upcoming placement, interview, target
                    company, or any specific goal.
                  </p>
                </div>
              </div>

              <textarea
                className="narrative-input"
                value={careerGoal}
                onChange={(event) =>
                  setCareerGoal(event.target.value)
                }
                placeholder="Example: I am targeting Data Analyst roles for campus placements and have around 4 months to prepare..."
              />
            </div>
          </div>

          <div className="divider"></div>

          {/* CORE COMPETENCIES */}
          <div className="form-section">
            <div className="section-heading">
              <div className="section-icon purple">✦</div>

              <div>
                <h3>Core Competencies</h3>
                <p>
                  Choose the skills you already know. Leave them
                  unselected if you are starting from scratch.
                </p>
              </div>
            </div>

            <div className="skill-header">
              <span className="helper-text">
                {targetRole
                  ? "Skills recommended for your target role"
                  : "Select a target role to see recommended skills"}
              </span>

              <span className="skill-count">
                {selectedSkills.length} selected
              </span>
            </div>

            <div className="skills-container">
              {loadingSkills && (
                <span className="helper-text">
                  Loading role skills...
                </span>
              )}

              {!loadingSkills &&
                skills.map((skill) => (
                  <div
                    key={skill._id}
                    className={`skill-pill ${
                      selectedSkills.includes(skill._id)
                        ? "selected"
                        : ""
                    }`}
                    onClick={() => toggleSkill(skill._id)}
                    role="checkbox"
                    aria-checked={selectedSkills.includes(skill._id)}
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" ||
                        event.key === " "
                      ) {
                        event.preventDefault();
                        toggleSkill(skill._id);
                      }
                    }}
                  >
                    <span>{skill.name}</span>

                    {selectedSkills.includes(skill._id) && (
                      <button
                        type="button"
                        className="remove-icon"
                        aria-label={`Remove ${skill.name}`}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleSkill(skill._id);
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}

              {!loadingSkills &&
                targetRole &&
                skills.length === 0 && (
                  <span className="helper-text">
                    No skills found. Check the skills catalog in
                    MongoDB and the browser console.
                  </span>
                )}
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              style={{
                color: "#dc2626",
                margin: "15px 0",
                fontSize: "14px",
              }}
            >
              {errorMessage}
            </div>
          )}

          <div className="form-footer">
            <span className="save-note">
              🔒 Your information stays private
            </span>

            <button
              type="button"
              className="continue-btn"
              onClick={handleContinue}
              disabled={
                savingProfile ||
                loadingQualifications ||
                loadingFields ||
                loadingRoles ||
                loadingSkills
              }
            >
              {savingProfile ? "Saving..." : "Continue"}
              <span>→</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Options;
