
const ROLE_SKILLS = {
  "full stack developer": [
    ["HTML", 6], ["CSS", 8], ["JavaScript", 16],
    ["React.js", 18], ["Node.js", 14], ["Express.js", 10],
    ["MongoDB", 10], ["Git & GitHub", 5], ["Deployment", 8],
  ],
  "frontend developer": [
    ["HTML", 6], ["CSS", 10], ["JavaScript", 18],
    ["React.js", 20], ["Responsive Design", 8],
    ["Git & GitHub", 5], ["Deployment", 6],
  ],
  "backend developer": [
    ["Programming Fundamentals", 10], ["JavaScript", 12],
    ["Node.js", 14], ["Express.js", 10], ["REST APIs", 8],
    ["MongoDB", 10], ["Authentication", 8],
    ["Git & GitHub", 5], ["Deployment", 8],
  ],
  "software engineer": [
    ["Programming Fundamentals", 12], ["Data Structures & Algorithms", 20],
    ["Object-Oriented Programming", 12], ["Database Management", 10],
    ["Operating Systems", 8], ["Computer Networks", 8],
    ["Git & GitHub", 5], ["Software Design", 10],
    ["Testing & Debugging", 8], ["Projects", 15],
  ],
  "data analyst": [
    ["Excel", 10], ["SQL", 16], ["Statistics", 14],
    ["Python", 18], ["Pandas", 10], ["Data Visualization", 12],
    ["Power BI", 12], ["Portfolio Projects", 12],
  ],
  "data scientist": [
    ["Python", 18], ["Statistics & Probability", 16],
    ["SQL", 12], ["Pandas", 10], ["NumPy", 8],
    ["Data Visualization", 10], ["Machine Learning", 22],
    ["Feature Engineering", 12], ["Model Evaluation", 10],
    ["Data Science Projects", 16],
  ],
  "machine learning engineer": [
    ["Python", 16], ["Statistics & Probability", 12],
    ["NumPy & Pandas", 10], ["Machine Learning", 20],
    ["Deep Learning Fundamentals", 16], ["Model Evaluation", 10],
    ["REST APIs", 8], ["Model Deployment", 14],
    ["Git & GitHub", 5], ["ML Projects", 16],
  ],
  "ai engineer": [
    ["Python", 14], ["Machine Learning Fundamentals", 16],
    ["Deep Learning Fundamentals", 16], ["LLM Fundamentals", 12],
    ["Prompt Engineering", 6], ["API Integration", 8],
    ["Vector Databases & Embeddings", 12], ["RAG Fundamentals", 12],
    ["Model Evaluation", 8], ["AI Projects", 16],
  ],
  "business analyst": [
    ["Excel", 10], ["SQL", 12], ["Business Analysis Fundamentals", 12],
    ["Requirements Gathering", 10], ["Process Mapping", 8],
    ["Data Visualization", 10], ["Power BI", 12],
    ["Communication & Presentation", 8], ["Business Case Studies", 12],
  ],
  "cybersecurity analyst": [
    ["Networking Fundamentals", 14], ["Linux Fundamentals", 10],
    ["Security Fundamentals", 12], ["Python Basics", 10],
    ["Threat Analysis", 12], ["SIEM Fundamentals", 12],
    ["Vulnerability Assessment", 12], ["Incident Response", 10],
    ["Security Labs & Projects", 14],
  ],
  "financial analyst": [
    ["Excel", 16], ["Accounting Fundamentals", 14],
    ["Financial Statements", 18], ["Financial Modeling", 20],
    ["Financial Analysis", 16], ["SQL", 10],
    ["Data Visualization", 10], ["Presentation Skills", 6],
  ],
};

const ROLE_ALIASES = {
  "data science": "data scientist",
  "ml engineer": "machine learning engineer",
  "machine learning developer": "machine learning engineer",
  "artificial intelligence engineer": "ai engineer",
  "ai developer": "ai engineer",
  "fullstack developer": "full stack developer",
  "full-stack developer": "full stack developer",
  "frontend engineer": "frontend developer",
  "front end developer": "frontend developer",
  "backend engineer": "backend developer",
  "back end developer": "backend developer",
  "software developer": "software engineer",
  "business intelligence analyst": "business analyst",
  "cyber security analyst": "cybersecurity analyst",
  "cyber security analyst ": "cybersecurity analyst",
};

const GENERIC_SKILL_SETS = {
  technology: [
    ["Programming Fundamentals", 12],
    ["Data Structures & Algorithms", 16],
    ["Git & GitHub", 5],
    ["Database Fundamentals", 10],
    ["API Fundamentals", 8],
    ["Testing & Debugging", 8],
    ["Projects & Portfolio", 14],
  ],
  data: [
    ["Excel", 8], ["SQL", 12], ["Statistics", 12],
    ["Python", 14], ["Data Cleaning", 10],
    ["Data Visualization", 10], ["Portfolio Projects", 12],
  ],
  business: [
    ["Excel", 10], ["Communication Skills", 8],
    ["Business Fundamentals", 12], ["Data Analysis", 12],
    ["Presentation Skills", 8], ["Problem Solving", 8],
    ["Practical Case Studies", 12],
  ],
  general: [
    ["Domain Fundamentals", 10], ["Communication Skills", 8],
    ["Research & Problem Solving", 10], ["Digital Tools", 8],
    ["Data Literacy", 8], ["Project Planning", 8],
    ["Practical Projects", 12],
  ],
};

const normalize = (value = "") =>
  String(value)
    .trim()
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ");

function getRoleCatalog(targetRole, field = "") {
  const normalizedRole = normalize(targetRole);
  const roleKey = ROLE_ALIASES[normalizedRole] || normalizedRole;

  if (ROLE_SKILLS[roleKey]) {
    return ROLE_SKILLS[roleKey];
  }

  const context = `${normalizedRole} ${normalize(field)}`;

  if (/data scientist|machine learning|artificial intelligence|\bai\b|\bml\b/.test(context)) {
    return ROLE_SKILLS["data scientist"];
  }

  if (/data analyst|business intelligence|analytics|data analysis/.test(context)) {
    return ROLE_SKILLS["data analyst"];
  }

  if (/financial|finance|accountant|accounting/.test(context)) {
    return ROLE_SKILLS["financial analyst"];
  }

  if (/cyber|security|penetration|information security/.test(context)) {
    return ROLE_SKILLS["cybersecurity analyst"];
  }

  if (/business analyst|business analysis/.test(context)) {
    return ROLE_SKILLS["business analyst"];
  }

  if (/frontend|front end|ui developer/.test(context)) {
    return ROLE_SKILLS["frontend developer"];
  }

  if (/backend|back end|server side/.test(context)) {
    return ROLE_SKILLS["backend developer"];
  }

  if (/full.?stack/.test(context)) {
    return ROLE_SKILLS["full stack developer"];
  }

  if (/software|developer|engineer|programmer|web development|mobile app/.test(context)) {
    return ROLE_SKILLS["software engineer"];
  }

  if (/commerce|management|business|marketing|sales|human resource|hr/.test(context)) {
    return GENERIC_SKILL_SETS.business;
  }

  if (/data|statistics|math|computer science|analytics/.test(context)) {
    return GENERIC_SKILL_SETS.data;
  }

  if (/technology|computer|engineering|information technology|it\b/.test(context)) {
    return GENERIC_SKILL_SETS.technology;
  }

  return GENERIC_SKILL_SETS.general;
}

export function buildCareerAnalysis(profile) {
  const roleName = String(profile.targetRole || "").trim();

  if (!roleName) {
    const error = new Error("Target role is required.");
    error.statusCode = 400;
    throw error;
  }

  const catalog = getRoleCatalog(roleName, profile.field);

  const known = new Set(
    (Array.isArray(profile.knownSkills) ? profile.knownSkills : [])
      .map(normalize)
      .filter(Boolean)
  );

  const completed = new Set(
    (Array.isArray(profile.completedSkills) ? profile.completedSkills : [])
      .map(normalize)
      .filter(Boolean)
  );

  const skills = catalog.map(([name, estimatedHours], index) => {
    const key = normalize(name);
    const isCompleted = completed.has(key);
    const isKnown = known.has(key);

    return {
      name,
      estimatedHours,
      status: isCompleted
        ? "completed"
        : isKnown
          ? "active"
          : "pending",
      priority: index < 3 ? "high" : index < 6 ? "medium" : "normal",
    };
  });

  const completedCount = skills.filter(
    (skill) => skill.status === "completed"
  ).length;

  const knownCount = skills.filter(
    (skill) => skill.status === "active" || skill.status === "completed"
  ).length;

  const totalHours = skills.reduce(
    (sum, skill) => sum + skill.estimatedHours,
    0
  );

  const remainingHours = skills.reduce(
    (sum, skill) =>
      sum + (skill.status === "completed" ? 0 : skill.estimatedHours),
    0
  );

  return {
    targetRole: roleName,
    degree: profile.degree,
    field: profile.field,
    timelineMonths: profile.timelineMonths,
    totalSkills: skills.length,
    knownSkillCount: knownCount,
    completedSkillCount: completedCount,
    missingSkillCount: skills.filter(
      (skill) => skill.status === "pending"
    ).length,
    readinessPercentage: skills.length
      ? Math.round((knownCount / skills.length) * 100)
      : 0,
    totalEstimatedHours: totalHours,
    remainingEstimatedHours: remainingHours,
    skills,
  };
}
