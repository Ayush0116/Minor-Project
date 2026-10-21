
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  User, Pencil, MapPin, Mail, Phone, Calendar, Globe, Plus,
  LogOut, Code2, ExternalLink, ShieldCheck, Share2, Eye,
  Sparkles, CheckCircle2, ChevronRight, Briefcase, GraduationCap,
  Target, Clock3, Building2, Award, Download, Settings,
  MoreHorizontal, Zap, Star, Save, X, Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import LeftNavbar from "../Navbar/left-navbar/leftnavbar";
import "./Profile.css";


const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const emptyProfile = {
  fullName: "",
  headline: "Student",
  email: "",
  phone: "",
  location: "",
  dateOfBirth: "",
  summary: "",
  industry: "",
  experienceYears: 0,
  availability: "",
  visibility: "public",
  skills: [],
  education: [],
  achievements: [],
  links: {
    linkedin: "",
    github: "",
    portfolio: "",
    other: [],
  },
  careerPreferences: {
    targetRole: "",
    preferredIndustries: [],
    workMode: "Hybrid / Remote",
    targetLocations: [],
    expectedSalary: "",
    noticePeriod: "",
  },
  profileViews: 0,
  applications: 0,
  shortlisted: 0,
};

const getToken = () =>
  localStorage.getItem("token") ||
  localStorage.getItem("authToken") ||
  localStorage.getItem("jwt");

const safeArray = (value) => Array.isArray(value) ? value : [];

const initials = (name = "") =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2)
    .map((part) => part[0].toUpperCase()).join("") || "U";

const profileStrength = (profile) => {
  const checks = [
    profile.fullName,
    profile.headline,
    profile.email,
    profile.phone,
    profile.location,
    profile.summary,
    profile.industry,
    profile.skills?.length,
    profile.education?.length,
    profile.links?.linkedin || profile.links?.github || profile.links?.portfolio,
    profile.careerPreferences?.targetRole,
    profile.careerPreferences?.targetLocations?.length,
  ];

  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
};

const Profile = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(emptyProfile);
  const [draft, setDraft] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const strength = useMemo(() => profileStrength(profile), [profile]);

  const loadProfile = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setError("Login session nahi mili. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Profile load nahi ho payi.");
      }

      const merged = {
        ...emptyProfile,
        ...result.profile,
        links: {
          ...emptyProfile.links,
          ...(result.profile?.links || {}),
        },
        careerPreferences: {
          ...emptyProfile.careerPreferences,
          ...(result.profile?.careerPreferences || {}),
        },
        skills: safeArray(result.profile?.skills),
        education: safeArray(result.profile?.education),
        achievements: safeArray(result.profile?.achievements),
      };

      setProfile(merged);
      setDraft(merged);
    } catch (err) {
      setError(err.message || "Profile load karte waqt error aaya.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateField = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
  };

  const updateNested = (parent, field, value) => {
    setDraft((previous) => ({
      ...previous,
      [parent]: {
        ...(previous[parent] || {}),
        [field]: value,
      },
    }));
  };

  const updateArrayItem = (field, index, key, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: previous[field].map((item, i) =>
        i === index ? { ...item, [key]: value } : item
      ),
    }));
  };

  const addItem = (field, item) => {
    setDraft((previous) => ({
      ...previous,
      [field]: [...safeArray(previous[field]), item],
    }));
  };

  const removeItem = (field, index) => {
    setDraft((previous) => ({
      ...previous,
      [field]: previous[field].filter((_, i) => i !== index),
    }));
  };

  const saveProfile = async (event) => {
    event?.preventDefault();

    const token = getToken();

    if (!token) {
      setError("Login session expire ho gayi. Please login again.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        fullName: draft.fullName,
        headline: draft.headline,
        email: draft.email,
        phone: draft.phone,
        location: draft.location,
        dateOfBirth: draft.dateOfBirth,
        summary: draft.summary,
        industry: draft.industry,
        experienceYears: Number(draft.experienceYears) || 0,
        availability: draft.availability,
        visibility: draft.visibility,
        links: draft.links,
        careerPreferences: draft.careerPreferences,
        skills: draft.skills.map(({ name, level, proficiency }) => ({
          name,
          level,
          proficiency: Number(proficiency) || 0,
        })),
        education: draft.education,
        achievements: draft.achievements,
      };

      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Profile save nahi ho payi.");
      }

      const saved = {
        ...emptyProfile,
        ...result.profile,
        links: {
          ...emptyProfile.links,
          ...(result.profile?.links || {}),
        },
        careerPreferences: {
          ...emptyProfile.careerPreferences,
          ...(result.profile?.careerPreferences || {}),
        },
        skills: safeArray(result.profile?.skills),
        education: safeArray(result.profile?.education),
        achievements: safeArray(result.profile?.achievements),
      };

      setProfile(saved);
      setDraft(saved);
      setEditing(false);
      setMessage("Profile successfully save ho gayi!");
    } catch (err) {
      setError(err.message || "Profile save karte waqt error aaya.");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditing = () => {
    setDraft(profile);
    setEditing(false);
    setError("");
    setMessage("");
  };

  const editButton = (
    <button
      type="button"
      className="icon-action-btn"
      onClick={() => {
        setDraft(profile);
        setEditing(true);
        setMessage("");
        setError("");
      }}
      aria-label="Edit profile"
      title="Edit profile"
    >
      <Pencil size={13} />
    </button>
  );

  const renderValue = (value) => value || "Not added yet";

  const openLink = (url) => {
    if (!url) return;
    const normalized = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    window.open(normalized, "_blank", "noopener,noreferrer");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  if (loading) {
    return (
      <>
        <LeftNavbar />
        <main className="profile-main-container">
          <div className="profile-card">Loading your profile...</div>
        </main>
      </>
    );
  }

  return (
    <>
      <LeftNavbar />

      <main className="profile-main-container">
        <header className="profile-top-header">
          <div className="profile-header-content">
            <div className="profile-breadcrumb">
              Dashboard <ChevronRight size={13} /> Profile
            </div>

            <div className="profile-title-row">
              <div>
                <div className="profile-title-with-status">
                  <h1>My Profile</h1>
                  <span className="verified-profile-badge">
                    <ShieldCheck size={13} /> Profile
                  </span>
                </div>
                <p>Your professional identity, skills and career preferences in one place.</p>
              </div>
            </div>
          </div>
        </header>

        {error && <div className="profile-alert profile-alert-error">{error}</div>}
        {message && <div className="profile-alert profile-alert-success">{message}</div>}

        <section className="profile-card profile-strength-card">
          <div className="strength-main">
            <div className="strength-icon"><Sparkles size={21} /></div>
            <div className="strength-content">
              <div className="strength-title-row">
                <div>
                  <span className="section-eyebrow">PROFILE STRENGTH</span>
                  <h3>{strength >= 80 ? "You're making a great first impression" : "Let's complete your profile"}</h3>
                </div>
                <strong className="strength-percentage">{strength}%</strong>
              </div>
              <div className="profile-progress-track">
                <div className="profile-progress-fill" style={{ width: `${strength}%` }} />
              </div>
              <p>Add missing information, skills and professional links to improve your profile.</p>
            </div>
          </div>
          <button className="strength-action-btn" onClick={() => {
            setDraft(profile);
            setEditing(true);
          }}>
            {editing ? "Editing Profile" : "Complete Profile"} <ChevronRight size={15} />
          </button>
        </section>

        {editing && (
          <form className="profile-card profile-edit-form" onSubmit={saveProfile}>
            <div className="card-header-flex">
              <div>
                <span className="section-eyebrow">EDIT DETAILS</span>
                <h3>Update Your Profile</h3>
              </div>
              <button type="button" className="icon-action-btn" onClick={cancelEditing} aria-label="Cancel editing">
                <X size={16} />
              </button>
            </div>

            <div className="profile-edit-grid">
              <label>Full Name
                <input value={draft.fullName || ""} onChange={(e) => updateField("fullName", e.target.value)} />
              </label>
              <label>Professional Headline
                <input value={draft.headline || ""} onChange={(e) => updateField("headline", e.target.value)} />
              </label>
              <label>Email Address
                <input type="email" value={draft.email || ""} onChange={(e) => updateField("email", e.target.value)} />
              </label>
              <label>Phone Number
                <input value={draft.phone || ""} onChange={(e) => updateField("phone", e.target.value)} />
              </label>
              <label>Location
                <input value={draft.location || ""} onChange={(e) => updateField("location", e.target.value)} />
              </label>
              <label>Date of Birth
                <input type="date" value={draft.dateOfBirth || ""} onChange={(e) => updateField("dateOfBirth", e.target.value)} />
              </label>
              <label>Industry
                <input value={draft.industry || ""} onChange={(e) => updateField("industry", e.target.value)} />
              </label>
              <label>Experience (years)
                <input type="number" min="0" value={draft.experienceYears ?? 0} onChange={(e) => updateField("experienceYears", e.target.value)} />
              </label>
              <label>Availability
                <input value={draft.availability || ""} onChange={(e) => updateField("availability", e.target.value)} placeholder="Open to opportunities" />
              </label>
              <label>Profile Visibility
                <select value={draft.visibility || "public"} onChange={(e) => updateField("visibility", e.target.value)}>
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </label>
              <label className="profile-edit-full">Professional Summary
                <textarea rows={4} value={draft.summary || ""} onChange={(e) => updateField("summary", e.target.value)} />
              </label>
            </div>

            <div className="profile-edit-section">
              <h4>Professional Links</h4>
              <div className="profile-edit-grid">
                <label>LinkedIn URL
                  <input value={draft.links?.linkedin || ""} onChange={(e) => updateNested("links", "linkedin", e.target.value)} />
                </label>
                <label>GitHub URL
                  <input value={draft.links?.github || ""} onChange={(e) => updateNested("links", "github", e.target.value)} />
                </label>
                <label className="profile-edit-full">Portfolio URL
                  <input value={draft.links?.portfolio || ""} onChange={(e) => updateNested("links", "portfolio", e.target.value)} />
                </label>
              </div>
            </div>

            <div className="profile-edit-section">
              <div className="profile-edit-section-title">
                <h4>Skills & Technologies</h4>
                <button type="button" className="text-action-btn" onClick={() => addItem("skills", { name: "", level: "Beginner", proficiency: 0 })}>
                  <Plus size={13} /> Add Skill
                </button>
              </div>

              {safeArray(draft.skills).map((skill, index) => (
                <div className="profile-edit-array-row" key={skill._id || `skill-${index}`}>
                  <input aria-label="Skill name" placeholder="Skill name" value={skill.name || ""} onChange={(e) => updateArrayItem("skills", index, "name", e.target.value)} />
                  <select aria-label="Skill level" value={skill.level || "Beginner"} onChange={(e) => updateArrayItem("skills", index, "level", e.target.value)}>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                  <input aria-label="Proficiency percentage" type="number" min="0" max="100" placeholder="%" value={skill.proficiency ?? 0} onChange={(e) => updateArrayItem("skills", index, "proficiency", e.target.value)} />
                  <button type="button" className="profile-remove-btn" onClick={() => removeItem("skills", index)} aria-label="Remove skill"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>

            <div className="profile-edit-section">
              <div className="profile-edit-section-title">
                <h4>Education</h4>
                <button type="button" className="text-action-btn" onClick={() => addItem("education", { degree: "", institution: "", field: "", startYear: "", endYear: "", location: "" })}>
                  <Plus size={13} /> Add Education
                </button>
              </div>

              {safeArray(draft.education).map((edu, index) => (
                <div className="profile-edit-record" key={edu._id || `education-${index}`}>
                  <div className="profile-edit-grid">
                    <label>Degree
                      <input value={edu.degree || ""} onChange={(e) => updateArrayItem("education", index, "degree", e.target.value)} />
                    </label>
                    <label>Institution
                      <input value={edu.institution || ""} onChange={(e) => updateArrayItem("education", index, "institution", e.target.value)} />
                    </label>
                    <label>Field of Study
                      <input value={edu.field || ""} onChange={(e) => updateArrayItem("education", index, "field", e.target.value)} />
                    </label>
                    <label>Location
                      <input value={edu.location || ""} onChange={(e) => updateArrayItem("education", index, "location", e.target.value)} />
                    </label>
                    <label>Start Year
                      <input value={edu.startYear || ""} onChange={(e) => updateArrayItem("education", index, "startYear", e.target.value)} />
                    </label>
                    <label>End Year
                      <input value={edu.endYear || ""} onChange={(e) => updateArrayItem("education", index, "endYear", e.target.value)} />
                    </label>
                  </div>
                  <button type="button" className="profile-remove-btn" onClick={() => removeItem("education", index)}>
                    <Trash2 size={14} /> Remove education
                  </button>
                </div>
              ))}
            </div>

            <div className="profile-edit-section">
              <div className="profile-edit-section-title">
                <h4>Achievements</h4>
                <button type="button" className="text-action-btn" onClick={() => addItem("achievements", { title: "", description: "", year: "" })}>
                  <Plus size={13} /> Add Achievement
                </button>
              </div>

              {safeArray(draft.achievements).map((achievement, index) => (
                <div className="profile-edit-record" key={achievement._id || `achievement-${index}`}>
                  <div className="profile-edit-grid">
                    <label>Achievement Title
                      <input value={achievement.title || ""} onChange={(e) => updateArrayItem("achievements", index, "title", e.target.value)} />
                    </label>
                    <label>Year
                      <input value={achievement.year || ""} onChange={(e) => updateArrayItem("achievements", index, "year", e.target.value)} />
                    </label>
                    <label className="profile-edit-full">Description
                      <textarea rows={2} value={achievement.description || ""} onChange={(e) => updateArrayItem("achievements", index, "description", e.target.value)} />
                    </label>
                  </div>
                  <button type="button" className="profile-remove-btn" onClick={() => removeItem("achievements", index)}>
                    <Trash2 size={14} /> Remove achievement
                  </button>
                </div>
              ))}
            </div>

            <div className="profile-edit-section">
              <h4>Career Preferences</h4>
              <div className="profile-edit-grid">
                <label>Target Role
                  <input value={draft.careerPreferences?.targetRole || ""} onChange={(e) => updateNested("careerPreferences", "targetRole", e.target.value)} />
                </label>
                <label>Preferred Industries
                  <input value={(draft.careerPreferences?.preferredIndustries || []).join(", ")} onChange={(e) => updateNested("careerPreferences", "preferredIndustries", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))} placeholder="IT, Finance, Education" />
                </label>
                <label>Work Mode
                  <select value={draft.careerPreferences?.workMode || "Hybrid / Remote"} onChange={(e) => updateNested("careerPreferences", "workMode", e.target.value)}>
                    <option>Hybrid / Remote</option>
                    <option>Remote</option>
                    <option>Hybrid</option>
                    <option>On-site</option>
                  </select>
                </label>
                <label>Target Locations
                  <input value={(draft.careerPreferences?.targetLocations || []).join(", ")} onChange={(e) => updateNested("careerPreferences", "targetLocations", e.target.value.split(",").map((v) => v.trim()).filter(Boolean))} placeholder="Bhopal, Indore" />
                </label>
                <label>Expected Salary
                  <input value={draft.careerPreferences?.expectedSalary || ""} onChange={(e) => updateNested("careerPreferences", "expectedSalary", e.target.value)} />
                </label>
                <label>Notice Period
                  <input value={draft.careerPreferences?.noticePeriod || ""} onChange={(e) => updateNested("careerPreferences", "noticePeriod", e.target.value)} />
                </label>
              </div>
            </div>

            <div className="profile-edit-actions">
              <button type="button" className="secondary-action-btn" onClick={cancelEditing} disabled={saving}>
                <X size={14} /> Cancel
              </button>
              <button type="submit" className="profile-save-btn" disabled={saving}>
                <Save size={15} /> {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        )}

        <div className="profile-grid-layout">
          <aside className="profile-left-column">
            <section className="profile-card user-identity-card">
              <div className="identity-card-top">
                <button className="icon-action-btn" onClick={() => setEditing(true)} aria-label="Edit profile">
                  <MoreHorizontal size={17} />
                </button>
              </div>

              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-circle">{initials(profile.fullName)}</div>
                <span className="profile-verified-dot"><CheckCircle2 size={14} /></span>
              </div>

              <h2>{renderValue(profile.fullName)}</h2>
              <p className="user-role-title">{renderValue(profile.headline)}</p>

              <div className="profile-open-status">
                <span className="availability-dot" />
                {renderValue(profile.availability)}
              </div>

              <div className="identity-meta-list">
                <div className="user-location-row"><MapPin size={14} />{renderValue(profile.location)}</div>
                <div className="user-email-row"><Mail size={14} />{renderValue(profile.email)}</div>
              </div>

              <div className="profile-stats-grid">
                {[
                  { label: "Profile Views", value: profile.profileViews, icon: Eye },
                  { label: "Applications", value: profile.applications, icon: Briefcase },
                  { label: "Shortlisted", value: profile.shortlisted, icon: CheckCircle2 },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div className="profile-stat-item" key={stat.label}>
                      <Icon size={15} />
                      <strong>{stat.value ?? 0}</strong>
                      <span>{stat.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="identity-actions">
                <button className="primary-action-btn" onClick={() => setEditing(true)}>
                  <Pencil size={14} /> Edit Profile
                </button>
                <button className="secondary-action-btn" onClick={() => {
                  const url = window.location.href;
                  if (navigator.share) navigator.share({ title: profile.fullName || "My Profile", url }).catch(() => {});
                  else navigator.clipboard?.writeText(url).then(() => setMessage("Profile link copied."));
                }}>
                  <Share2 size={14} /> Share Profile
                </button>
              </div>
            </section>

            <section className="profile-card visibility-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">DISCOVERABILITY</span>
                  <h3>Profile Visibility</h3>
                </div>
                <ShieldCheck size={19} />
              </div>
              <div className="visibility-box">
                <div className="visibility-icon"><Globe size={17} /></div>
                <div className="visibility-content">
                  <strong>{profile.visibility === "private" ? "Private Profile" : "Public Profile"}</strong>
                  <span>{profile.visibility === "private" ? "Your profile is private" : "Recruiters can discover you"}</span>
                </div>
                <div className={`visibility-toggle ${profile.visibility === "public" ? "active" : ""}`}><span /></div>
              </div>
              <button className="text-action-btn" onClick={() => setEditing(true)}>
                Manage visibility <ChevronRight size={14} />
              </button>
            </section>

            <section className="profile-card links-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">ONLINE PRESENCE</span>
                  <h3>Professional Links</h3>
                </div>
                {editButton}
              </div>

              <div className="links-list-stack">
                {[
                  { label: "LinkedIn", url: profile.links?.linkedin, icon: Globe },
                  { label: "GitHub", url: profile.links?.github, icon: Code2 },
                  { label: "Portfolio", url: profile.links?.portfolio, icon: Globe },
                ].map((link) => {
                  const Icon = link.icon;
                  return (
                    <a href={link.url || undefined} onClick={(e) => {
                      if (!link.url) { e.preventDefault(); setEditing(true); return; }
                      e.preventDefault();
                      openLink(link.url);
                    }} className="link-item-row" key={link.label}>
                      <span><Icon size={15} />{link.label}</span>
                      <ExternalLink size={12} className="ext-icon" />
                    </a>
                  );
                })}
              </div>
              <button className="add-link-action" onClick={() => setEditing(true)}>
                <Plus size={14} /> Edit professional links
              </button>
            </section>

            <section className="profile-card profile-tip-card">
              <div className="tip-icon"><Zap size={17} /></div>
              <div>
                <span className="section-eyebrow">PROFILE TIP</span>
                <h4>{profile.links?.portfolio ? "Keep your portfolio updated" : "Add a portfolio link"}</h4>
                <p>A portfolio can help recruiters explore your projects.</p>
              </div>
              <ChevronRight size={16} />
            </section>
          </aside>

          <div className="profile-right-column">
            <section className="profile-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">PROFESSIONAL SUMMARY</span>
                  <h3>About Me</h3>
                </div>
                {editButton}
              </div>
              <p className="about-text-content">{renderValue(profile.summary)}</p>
              <div className="about-highlights">
                <span><Code2 size={14} />{renderValue(profile.headline)}</span>
                <span><Zap size={14} />Problem Solver</span>
                <span><Sparkles size={14} />Continuous Learner</span>
              </div>
            </section>

            <section className="profile-card career-snapshot-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">CAREER OVERVIEW</span>
                  <h3>Career Snapshot</h3>
                </div>
                <Target size={19} />
              </div>
              <div className="career-snapshot-grid">
                {[
                  { label: "Experience", value: `${profile.experienceYears || 0} Years`, icon: Briefcase },
                  { label: "Industry", value: renderValue(profile.industry), icon: Building2 },
                  { label: "Availability", value: renderValue(profile.availability), icon: Clock3 },
                  { label: "Target Role", value: renderValue(profile.careerPreferences?.targetRole), icon: Target },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="career-snapshot-item" key={item.label}>
                      <div className="snapshot-icon"><Icon size={16} /></div>
                      <span>{item.label}</span>
                      <strong>{item.value}</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="profile-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">PERSONAL</span>
                  <h3>Personal Information</h3>
                </div>
                {editButton}
              </div>
              <div className="info-grid-2col">
                {[
                  { label: "Full Name", value: profile.fullName, icon: User },
                  { label: "Email Address", value: profile.email, icon: Mail },
                  { label: "Phone Number", value: profile.phone, icon: Phone },
                  { label: "Location", value: profile.location, icon: MapPin },
                  { label: "Date of Birth", value: profile.dateOfBirth, icon: Calendar },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="info-field-group" key={item.label}>
                      <span><Icon size={13} />{item.label}</span>
                      <strong>{renderValue(item.value)}</strong>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="profile-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">EDUCATION</span>
                  <h3>Academic Background</h3>
                </div>
                <button className="text-action-btn" onClick={() => setEditing(true)}><Plus size={13} /> Edit Education</button>
              </div>
              {profile.education.length ? profile.education.map((edu, index) => (
                <div className="education-block" key={edu._id || index}>
                  <div className="education-icon"><GraduationCap size={21} /></div>
                  <div className="education-content">
                    <h4>{renderValue(edu.degree)}{edu.field ? ` in ${edu.field}` : ""}</h4>
                    <span className="uni-name">{renderValue(edu.institution)}</span>
                    <p className="edu-timeline">
                      {edu.startYear || "—"} - {edu.endYear || "—"}
                      <span>•</span>{renderValue(edu.location)}
                    </p>
                  </div>
                  {editButton}
                </div>
              )) : <p className="about-text-content">Education details not added yet.</p>}
            </section>

            <section className="profile-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">EXPERTISE</span>
                  <h3>Skills & Technologies</h3>
                </div>
                <button className="text-action-btn" onClick={() => setEditing(true)}><Plus size={13} /> Edit Skills</button>
              </div>
              <div className="skill-proficiency-list">
                {profile.skills.length ? profile.skills.map((skill, index) => (
                  <div className="skill-proficiency-item" key={skill._id || `${skill.name}-${index}`}>
                    <div className="skill-name-row">
                      <div>
                        <strong>{skill.name}</strong>
                        <span>{skill.level}</span>
                      </div>
                      <small>{skill.proficiency ?? 0}%</small>
                    </div>
                    <div className="skill-progress-track">
                      <div className="skill-progress-fill" style={{ width: `${Math.min(100, Math.max(0, Number(skill.proficiency) || 0))}%` }} />
                    </div>
                  </div>
                )) : <p className="about-text-content">No skills added yet. Use Edit Skills to add them.</p>}
              </div>
            </section>

            <section className="profile-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">JOB SEARCH</span>
                  <h3>Career Preferences</h3>
                </div>
                {editButton}
              </div>
              <div className="info-grid-2col preference-grid">
                {[
                  { label: "Target Role", value: profile.careerPreferences?.targetRole, icon: Target },
                  { label: "Preferred Industry", value: profile.careerPreferences?.preferredIndustries?.join(", "), icon: Building2 },
                  { label: "Work Mode", value: profile.careerPreferences?.workMode, icon: Globe },
                  { label: "Target Location", value: profile.careerPreferences?.targetLocations?.join(", "), icon: MapPin },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div className="info-field-group" key={item.label}>
                      <span><Icon size={13} />{item.label}</span>
                      <strong>{renderValue(item.value)}</strong>
                    </div>
                  );
                })}
              </div>
              <div className="career-preference-footer">
                <div><span>Expected Salary</span><strong>{renderValue(profile.careerPreferences?.expectedSalary)}</strong></div>
                <div><span>Notice Period</span><strong>{renderValue(profile.careerPreferences?.noticePeriod)}</strong></div>
              </div>
            </section>

            <section className="profile-card">
              <div className="card-header-flex">
                <div>
                  <span className="section-eyebrow">HIGHLIGHTS</span>
                  <h3>Achievements</h3>
                </div>
                <button className="text-action-btn" onClick={() => setEditing(true)}><Plus size={13} /> Edit Achievements</button>
              </div>
              <div className="achievement-list">
                {profile.achievements.length ? profile.achievements.map((item, index) => (
                  <div className="achievement-item" key={item._id || index}>
                    <div className="achievement-icon"><Award size={18} /></div>
                    <div className="achievement-content">
                      <strong>{item.title}</strong>
                      <span>{item.description}{item.year ? ` • ${item.year}` : ""}</span>
                    </div>
                    <ChevronRight size={15} />
                  </div>
                )) : <p className="about-text-content">No achievements added yet.</p>}
              </div>
            </section>

            <footer className="profile-footer-card">
              <div className="account-created-info">
                <div className="account-security-icon"><ShieldCheck size={17} /></div>
                <div>
                  <strong>Account secured</strong>
                  <span>{profile.createdAt ? `Member since ${new Date(profile.createdAt).toLocaleDateString()}` : "Your profile is connected to your account"}</span>
                </div>
              </div>
              <div className="profile-footer-actions">
  <button
    className="secondary-action-btn"
    onClick={() => window.print()}
  >
    <Download size={14} /> Download Profile
  </button>

  <button
    className="secondary-action-btn"
    onClick={() => setEditing(true)}
  >
    <Settings size={14} /> Settings
  </button>

  <button
    className="profile-save-btn"
    onClick={saveProfile}
    disabled={saving || !editing}
  >
    <Save size={14} /> {saving ? "Saving..." : "Save Profile"}
  </button>

  <button className="logout-action-btn" onClick={logout}>
    <LogOut size={14} /> Log Out
  </button>
</div>
            </footer>
          </div> 
        </div>
      </main>
    </>
  );
};

export default Profile;
