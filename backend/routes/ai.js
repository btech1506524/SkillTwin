const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// CAREER SIMULATION
// POST /api/ai/simulate
// =====================================================

router.post("/simulate", authMiddleware, async (req, res) => {

  try {

    // Dashboard scenario simulation. Keep the scoring model deterministic so
    // the displayed projection is reproducible and can run without role seed data.
    if (Array.isArray(req.body.addedSkills)) {
      const scenarioBoosts = { "LeetCode 150": 9, "Docker CI/CD": 11, "DBMS Indexing": 7, "System Design Mini": 12 };
      const totalBoost = Math.min(100 - Number(req.body.currentScore || 0), req.body.addedSkills.reduce((sum, item) => sum + (scenarioBoosts[item] || 5), 0));
      return res.json({ success: true, totalBoost: Math.max(0, totalBoost), targetRole: req.body.targetRole || "Software Developer" });
    }

    const {
      role_id,
      hours_per_week = 10
    } = req.body;

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "role_id is required."
      });
    }

    const [roles] = await db.query(
      `SELECT *
       FROM career_roles
       WHERE role_id = ?`,
      [role_id]
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
        role_id
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

      totalCurrent += current;
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
      hours_per_week > 0
        ? Math.max(
            4,
            Math.ceil(
              gap / (hours_per_week * 0.8)
            )
          )
        : 12;

    res.json({
      success: true,

      simulation: {
        targetRole: role.role_name,
        readinessScore: readiness,
        skillGap: gap,
        hoursPerWeek: hours_per_week,
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

      const {
        resumeText
      } = req.body;

      if (!resumeText) {
        return res.status(400).json({
          success: false,
          message: "Resume text is required."
        });
      }

      const text =
        resumeText.toLowerCase();

      const keywords = [
        "c++",
        "java",
        "python",
        "javascript",
        "react",
        "node.js",
        "express",
        "sql",
        "mysql",
        "git",
        "github",
        "data structures",
        "algorithms",
        "machine learning",
        "project",
        "internship"
      ];

      const detectedSkills =
        keywords.filter(
          keyword => text.includes(keyword)
        );

      let atsScore = 40;

      atsScore +=
        detectedSkills.length * 4;

      if (text.includes("project")) {
        atsScore += 5;
      }

      if (text.includes("internship")) {
        atsScore += 5;
      }

      atsScore =
        Math.min(100, atsScore);

      const strengths = [];

      if (detectedSkills.length > 0) {
        strengths.push(
          "Relevant technical skills detected."
        );
      }

      if (text.includes("project")) {
        strengths.push(
          "Project experience is present."
        );
      }

      if (text.includes("internship")) {
        strengths.push(
          "Internship experience detected."
        );
      }

      const weaknesses = [];

      if (!text.includes("github")) {
        weaknesses.push(
          "Add GitHub profile."
        );
      }

      if (!text.includes("internship")) {
        weaknesses.push(
          "Add internship or practical experience if available."
        );
      }

      if (!text.includes("achievement")) {
        weaknesses.push(
          "Add measurable achievements."
        );
      }

      const recommendations = [
        "Use keywords relevant to your target role.",
        "Add measurable results to projects.",
        "Keep formatting simple and ATS-friendly.",
        "Add GitHub and LinkedIn links.",
        "Customize the resume for each job."
      ];

      res.json({
        success: true,
        matchPercentage: atsScore,
        strengths,
        gaps: weaknesses,
        recommendedKeywords: recommendations,

        analysis: {
          atsScore,
          detectedSkills,
          strengths,
          weaknesses,
          recommendations
        }
      });

    } catch (error) {

      console.error(
        "Resume analysis error:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Resume analysis failed."
      });

    }
  }
);


module.exports = router;
