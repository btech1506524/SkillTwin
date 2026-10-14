const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const resumeSkillAliases = {
  "Data Structures & Algorithms": ["data structures and algorithms", "data structures & algorithms", "data structures", "algorithms", "dsa"],
  "Object-Oriented Programming (Java/C++)": ["object-oriented programming", "object oriented programming", "oop", "java", "c++", "c plus plus"],
  "DBMS & SQL Queries": ["database management systems", "dbms", "sql", "mysql", "postgresql", "database queries"],
  "Operating Systems & Linux": ["operating systems", "linux", "unix"],
  "Computer Networks": ["computer networks", "networking", "tcp/ip", "http"],
  "React.js & Frontend": ["react.js", "reactjs", "react", "frontend", "front-end"],
  "Node.js & REST APIs": ["node.js", "nodejs", "express.js", "express", "rest api", "restful api"],
  "Git, Docker & CI/CD": ["git", "github", "docker", "ci/cd", "continuous integration", "continuous deployment"],
  "System Design Fundamentals": ["system design", "distributed systems", "software architecture"],
  "HTML": ["html", "html5"],
  "CSS": ["css", "css3", "tailwind", "bootstrap"],
  "JavaScript": ["javascript", "typescript", "ecmascript"],
  "Python": ["python", "pandas", "numpy", "scikit-learn"],
  "Machine Learning": ["machine learning", "deep learning", "tensorflow", "pytorch", "scikit-learn"],
  "Statistics & Data Analysis": ["statistics", "statistical analysis", "data analysis", "data analytics", "excel", "tableau", "power bi"],
  "Cloud Platforms & Deployment": ["aws", "amazon web services", "azure", "gcp", "google cloud", "cloud deployment", "cloud platforms"]
};

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findResumeEvidence(text, skillName) {
  const aliases = resumeSkillAliases[skillName] || [skillName];
  return aliases.find(alias => {
    if (alias.startsWith("\\b") && alias.endsWith("\\b")) return new RegExp(alias, "i").test(text);
    const pattern = escapeRegex(alias).replace(/\s+/g, "\\s+");
    return new RegExp(`(^|[^\\p{L}\\p{N}])${pattern}(?=$|[^\\p{L}\\p{N}])`, "iu").test(text);
  }) || null;
}


// =====================================================
// CAREER SIMULATION
// POST /api/ai/simulate
// =====================================================

router.post("/simulate", authMiddleware, async (req, res) => {

  try {

    // Dashboard scenario simulation. Keep the scoring model deterministic so
    // the displayed projection is reproducible and can run without role seed data.
    if (Array.isArray(req.body?.addedSkills)) {
      const scenarioBoosts = { "LeetCode 150": 9, "Docker CI/CD": 11, "DBMS Indexing": 7, "System Design Mini": 12 };
      const { addedSkills } = req.body;
      const currentScore = Number(req.body.currentScore);
      const targetRole = typeof req.body.targetRole === "string" ? req.body.targetRole.trim() : "Software Developer";
      if (!Number.isFinite(currentScore) || currentScore < 0 || currentScore > 100 ||
          addedSkills.length > Object.keys(scenarioBoosts).length ||
          addedSkills.some(skill => typeof skill !== "string" || !Object.hasOwn(scenarioBoosts, skill)) ||
          new Set(addedSkills).size !== addedSkills.length || targetRole.length > 120) {
        return res.status(400).json({ success: false, message: "Scenario skills, readiness score, or target role are invalid." });
      }
      const requestedBoost = addedSkills.reduce((sum, item) => sum + scenarioBoosts[item], 0);
      const totalBoost = Math.min(100 - currentScore, requestedBoost);
      return res.json({ success: true, totalBoost, targetRole: targetRole || "Software Developer" });
    }

    const {
      role_id,
      hours_per_week = 10
    } = req.body || {};

    const normalizedRoleId = Number(role_id);
    const hoursPerWeek = Number(hours_per_week);
    if (!Number.isSafeInteger(normalizedRoleId) || normalizedRoleId < 1) {
      return res.status(400).json({
        success: false,
        message: "A valid role_id is required."
      });
    }
    if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 1 || hoursPerWeek > 80) {
      return res.status(400).json({ success: false, message: "hours_per_week must be between 1 and 80." });
    }

    const [roles] = await db.query(
      `SELECT *
       FROM career_roles
       WHERE role_id = ?`,
      [normalizedRoleId]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Career role not found."
      });
    }

    const role = roles[0];

    const [skills] = await db.query(
      `SELECT
        s.skill_id,
        s.skill_name,
        us.proficiency_score,
        crs.required_level,
        crs.importance
       FROM career_role_skills crs
       JOIN skills s
         ON crs.skill_id = s.skill_id
       LEFT JOIN user_skills us
         ON us.skill_id = s.skill_id
        AND us.user_id = ?
       WHERE crs.role_id = ?`,
      [
        req.user.user_id,
        normalizedRoleId
      ]
    );

    let totalCurrent = 0;
    let totalRequired = 0;

    skills.forEach(skill => {

      const current =
        Number(skill.proficiency_score || 0);

      let required = 50;

      if (skill.required_level === "Beginner") {
        required = 25;
      }

      if (skill.required_level === "Intermediate") {
        required = 50;
      }

      if (skill.required_level === "Advanced") {
        required = 75;
      }

      if (skill.required_level === "Expert") {
        required = 100;
      }

      totalCurrent += Math.min(current, required);
      totalRequired += required;

    });

    const readiness =
      totalRequired > 0
        ? Math.min(
            100,
            Math.round(
              (totalCurrent / totalRequired) * 100
            )
          )
        : 0;

    const gap =
      Math.max(0, 100 - readiness);

    const estimatedWeeks =
      Math.max(4, Math.ceil(gap / (hoursPerWeek * 0.8)));

    res.json({
      success: true,

      simulation: {
        targetRole: role.role_name,
        readinessScore: readiness,
        skillGap: gap,
        hoursPerWeek,
        estimatedWeeks,
        skills
      }
    });

  } catch (error) {

    console.error("AI simulation error:", error);

    res.status(500).json({
      success: false,
      message: "Simulation failed."
    });

  }
});


// =====================================================
// RESUME ANALYSIS
// POST /api/ai/analyze-resume
// =====================================================

router.post(
  "/analyze-resume",
  authMiddleware,
  async (req, res) => {
    try {
      const resumeText = typeof req.body?.resumeText === "string" ? req.body.resumeText.trim() : "";
      if (!resumeText) {
        return res.status(400).json({ success: false, message: "Paste your resume text to analyze it." });
      }
      if (resumeText.length > 20000) {
        return res.status(413).json({ success: false, message: "Resume text must be 20,000 characters or fewer." });
      }

      const [requirements] = await db.query(
        `SELECT r.role_name AS roleName, s.skill_id AS skillId, s.skill_name AS skillName,
                s.category, crs.required_level AS requiredLevel, crs.importance
         FROM users u
         JOIN career_roles r ON r.role_name = u.target_role
         JOIN career_role_skills crs ON crs.role_id = r.role_id
         JOIN skills s ON s.skill_id = crs.skill_id
         WHERE u.user_id = ?
         ORDER BY FIELD(crs.importance, 'Critical', 'High', 'Medium', 'Low'), s.skill_name`,
        [req.user.user_id]
      );
      if (!requirements.length) {
        return res.status(409).json({
          success: false,
          message: "Your selected role has no skill requirements yet. Choose a supported role or contact an administrator."
        });
      }

      const text = resumeText.normalize("NFKC");
      const matchedSkills = [];
      const missingSkills = [];
      for (const requirement of requirements) {
        const evidence = findResumeEvidence(text, requirement.skillName);
        const item = {
          skillId: requirement.skillId,
          skillName: requirement.skillName,
          category: requirement.category,
          requiredLevel: requirement.requiredLevel,
          importance: requirement.importance,
          ...(evidence ? { evidence } : {})
        };
        (evidence ? matchedSkills : missingSkills).push(item);
      }

      const matchPercentage = Math.round(matchedSkills.length / requirements.length * 100);
      const normalizedText = text.toLowerCase();
      const experienceSignals = {
        projects: /\bprojects?\b/i.test(normalizedText),
        internships: /\binternships?\b/i.test(normalizedText),
        measurableResults: /\b\d+(?:\.\d+)?\s*(?:%|percent\b|users?\b|customers?\b|requests?\b|hours?\b|days?\b|weeks?\b|months?\b|x\b)/i.test(normalizedText),
        github: /\bgithub\b/i.test(normalizedText)
      };
      const recommendations = missingSkills.slice(0, 6).map(skill =>
        `If you have relevant experience, add a specific example showing ${skill.skillName}.`
      );
      if (!experienceSignals.projects) recommendations.push("Add a project bullet describing what you built, the tools used, and the result.");
      if (!experienceSignals.measurableResults) recommendations.push("Add measurable outcomes to relevant experience where you can support the numbers.");
      if (!experienceSignals.github) recommendations.push("Add a GitHub link if it contains relevant work you want employers to review.");

      const strengths = [];
      if (experienceSignals.projects) strengths.push("Project experience is mentioned.");
      if (experienceSignals.internships) strengths.push("Internship experience is mentioned.");
      const gaps = missingSkills.map(skill => `${skill.skillName} (required: ${skill.requiredLevel}) has no matching keyword evidence.`);
      const recommendedKeywords = [...new Set(missingSkills.slice(0, 6).map(skill => skill.skillName))];

      res.json({
        success: true,
        roleName: requirements[0].roleName,
        matchPercentage,
        summary: {
          requiredSkillCount: requirements.length,
          matchedSkillCount: matchedSkills.length,
          missingSkillCount: missingSkills.length
        },
        matchedSkills,
        missingSkills,
        experienceSignals,
        strengths,
        gaps,
        recommendedKeywords,
        recommendations,
        analysisType: "deterministic_keyword_evidence"
      });
    } catch (error) {
      console.error("Resume analysis error:", error.code || error.name || "Error");
      res.status(500).json({
        success: false,
        message: "Resume analysis failed."
      });

    }
  }
);


module.exports = router;
