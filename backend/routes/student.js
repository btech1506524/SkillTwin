const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const levelScores = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
const importanceScores = { Low: 1, Medium: 2, High: 3, Critical: 4 };

async function getCareerReadiness(userId) {
  const [rows] = await db.query(
    `SELECT r.role_id, r.role_name, s.skill_id, s.skill_name, s.category,
            crs.required_level, crs.importance,
            profile.proficiency_score, profile.user_id AS profile_user_id
     FROM users u
     JOIN career_roles r ON r.role_name = u.target_role
     JOIN career_role_skills crs ON crs.role_id = r.role_id
     JOIN skills s ON s.skill_id = crs.skill_id
     LEFT JOIN (
       SELECT us.user_id,
              CASE
                WHEN source_skill.skill_name = 'Data Structures and Algorithms' THEN 'Data Structures & Algorithms'
                WHEN source_skill.skill_name IN ('C++', 'Java') THEN 'Object-Oriented Programming (Java/C++)'
                WHEN source_skill.skill_name = 'React' THEN 'React.js & Frontend'
                WHEN source_skill.skill_name = 'SQL' THEN 'DBMS & SQL Queries'
                ELSE source_skill.skill_name
              END AS canonical_skill_name,
              MAX(us.proficiency_score) AS proficiency_score
       FROM user_skills us
       JOIN skills source_skill ON source_skill.skill_id = us.skill_id
       GROUP BY us.user_id, canonical_skill_name
     ) profile ON profile.user_id = u.user_id AND profile.canonical_skill_name = s.skill_name
     WHERE u.user_id = ?
     ORDER BY crs.importance DESC, s.skill_name`,
    [userId]
  );

  if (!rows.length) {
    return {
      targetRole: null,
      readinessScore: 0,
      totalRequiredSkills: 0,
      missingCount: 0,
      belowTargetCount: 0,
      metCount: 0,
      skills: [],
      gaps: []
    };
  }

  const skills = rows.map(row => {
    const required = levelScores[row.required_level] || 50;
    const missing = row.profile_user_id === null;
    const current = missing ? 0 : Number(row.proficiency_score || 0);
    return {
      skillId: row.skill_id,
      skillName: row.skill_name,
      category: row.category,
      current,
      required,
      requiredLevel: row.required_level,
      importance: importanceScores[row.importance] || Number(row.importance) || 1,
      missing,
      gap: Math.max(0, required - current),
      status: missing ? "Missing" : current < required ? "Below target" : "Met"
    };
  });

  const totalRequired = skills.reduce((sum, skill) => sum + skill.required, 0);
  const totalCurrent = skills.reduce((sum, skill) => sum + Math.min(skill.current, skill.required), 0);
  const missingCount = skills.filter(skill => skill.missing).length;
  const belowTargetCount = skills.filter(skill => !skill.missing && skill.current < skill.required).length;

  return {
    targetRole: { id: rows[0].role_id, name: rows[0].role_name },
    readinessScore: totalRequired ? Math.round(totalCurrent / totalRequired * 100) : 0,
    totalRequiredSkills: skills.length,
    missingCount,
    belowTargetCount,
    metCount: skills.length - missingCount - belowTargetCount,
    skills,
    gaps: skills.filter(skill => skill.status !== "Met")
  };
}

async function refreshAndPersistReadiness(userId) {
  const readiness = await getCareerReadiness(userId);
  await db.query("UPDATE users SET readiness_score = ? WHERE user_id = ?", [readiness.readinessScore, userId]);
  return readiness;
}


// =====================================================
// GET STUDENT PROFILE
// GET /api/student/profile
// =====================================================

router.get("/profile", authMiddleware, async (req, res) => {
  try {

    const [rows] = await db.query(
      `SELECT 
        user_id,
        full_name,
        email,
        phone,
        college,
        branch,
        graduation_year,
        created_at
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Student not found."
      });
    }

    res.json({
      success: true,
      student: rows[0]
    });

  } catch (error) {

    console.error("Profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching profile."
    });

  }
});


// =====================================================
// GET STUDENT SKILLS
// GET /api/student/skills
// =====================================================

router.get("/skills", authMiddleware, async (req, res) => {
  try {

    const [rows] = await db.query(
      `SELECT
        us.user_skill_id,
        s.skill_id,
        s.skill_name,
        s.category,
        s.description,
        us.proficiency_level,
        us.proficiency_score,
        us.years_experience,
        us.last_updated
       FROM user_skills us
       JOIN skills s
         ON us.skill_id = s.skill_id
       WHERE us.user_id = ?
       ORDER BY s.skill_name`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      skills: rows
    });

  } catch (error) {

    console.error("Skills error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while fetching skills."
    });

  }
});


// =====================================================
// ADD / UPDATE STUDENT SKILL
// PUT /api/student/skills
// =====================================================

router.put("/skills", authMiddleware, async (req, res) => {

  try {

    const { skill_id, skillName, proficiency_level, proficiency_score, currentLevel, years_experience } = req.body;
    let resolvedSkillId = skill_id;
    if (!resolvedSkillId && skillName) {
      const [matches] = await db.query("SELECT skill_id FROM skills WHERE skill_name = ?", [skillName]);
      if (matches.length) resolvedSkillId = matches[0].skill_id;
    }

    if (!resolvedSkillId) {
      return res.status(400).json({
        success: false,
        message: "A valid skill_id or skillName is required."
      });
    }

    const score = Number(proficiency_score ?? currentLevel ?? 0);
    const years = Number(years_experience ?? 0);
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      return res.status(400).json({ success: false, message: "Skill score must be between 0 and 100." });
    }
    if (!Number.isFinite(years) || years < 0 || years > 80) {
      return res.status(400).json({ success: false, message: "Years of experience must be between 0 and 80." });
    }
    const level = proficiency_level || (score >= 100 ? "Expert" : score >= 75 ? "Advanced" : score >= 50 ? "Intermediate" : "Beginner");
    if (!Object.hasOwn(levelScores, level)) {
      return res.status(400).json({ success: false, message: "Invalid proficiency level." });
    }

    const [skill] = await db.query(
      "SELECT skill_id FROM skills WHERE skill_id = ?",
      [resolvedSkillId]
    );

    if (skill.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Skill not found."
      });
    }

    await db.query(
      `INSERT INTO user_skills
        (
          user_id,
          skill_id,
          proficiency_level,
          proficiency_score,
          years_experience
        )
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
          proficiency_level = VALUES(proficiency_level),
          proficiency_score = VALUES(proficiency_score),
          years_experience = VALUES(years_experience)`,
      [
        req.user.user_id,
        resolvedSkillId,
        level,
        score,
        years
      ]
    );

    const readiness = await refreshAndPersistReadiness(req.user.user_id);

    res.json({
      success: true,
      message: "Skill updated successfully.",
      readinessScore: readiness.readinessScore,
      readiness
    });

  } catch (error) {

    console.error("Update skill error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while updating skill."
    });

  }
});


// =====================================================
// GET TARGET CAREER ROLE
// GET /api/student/target-role
// =====================================================

router.get("/target-role", authMiddleware, async (req, res) => {

  try {

    const [rows] = await db.query(
      `SELECT
        r.role_id,
        r.role_name,
        r.description,
        r.average_salary,
        r.demand_level
       FROM roadmaps rm
       JOIN career_roles r
         ON rm.role_id = r.role_id
       WHERE rm.user_id = ?
       ORDER BY rm.created_at DESC
       LIMIT 1`,
      [req.user.user_id]
    );

    if (rows.length === 0) {

      return res.json({
        success: true,
        targetRole: null
      });

    }

    res.json({
      success: true,
      targetRole: rows[0]
    });

  } catch (error) {

    console.error("Target role error:", error);

    res.status(500).json({
      success: false,
      message: "Server error."
    });

  }
});


// =====================================================
// SET TARGET CAREER ROLE
// PUT /api/student/target-role
// =====================================================

router.put("/target-role", authMiddleware, async (req, res) => {

  try {

    let { role_id } = req.body;
    const { targetRole } = req.body;
    if (!role_id && targetRole) {
      const [matches] = await db.query("SELECT role_id FROM career_roles WHERE role_name = ?", [targetRole]);
      if (matches.length) role_id = matches[0].role_id;
    }

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "role_id is required."
      });
    }

    const [roles] = await db.query(
      "SELECT * FROM career_roles WHERE role_id = ?",
      [role_id]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Career role not found."
      });
    }

    const role = roles[0];

    await db.query("UPDATE users SET target_role = ? WHERE user_id = ?", [role.role_name, req.user.user_id]);

    const [existing] = await db.query(
      `SELECT roadmap_id
       FROM roadmaps
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 1`,
      [req.user.user_id]
    );

    if (existing.length > 0) {

      await db.query(
        `UPDATE roadmaps
         SET role_id = ?
         WHERE roadmap_id = ?`,
        [role_id, existing[0].roadmap_id]
      );

    } else {

      await db.query(
        `INSERT INTO roadmaps
          (
            user_id,
            role_id,
            roadmap_title,
            description,
            status
          )
         VALUES (?, ?, ?, ?, ?)`,
        [
          req.user.user_id,
          role_id,
          `${role.role_name} Career Roadmap`,
          `Personalized roadmap for ${role.role_name}`,
          "Not Started"
        ]
      );

    }

    res.json({
      success: true,
      message: "Target role updated successfully.",
      targetRole: role
    });

  } catch (error) {

    console.error("Target role update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error."
    });

  }
});


// =====================================================
// GET STUDENT READINESS
// GET /api/student/readiness
// =====================================================

router.put("/milestones", authMiddleware, async (req, res) => {
  try {
    const { milestoneId } = req.body;
    if (!milestoneId) return res.status(400).json({ success: false, message: "milestoneId is required." });
    const [existing] = await db.query("SELECT milestone_id FROM user_milestones WHERE user_id = ? AND milestone_key = ?", [req.user.user_id, milestoneId]);
    if (existing.length) {
      await db.query("DELETE FROM user_milestones WHERE milestone_id = ?", [existing[0].milestone_id]);
      return res.json({ success: true, completed: false });
    }
    await db.query("INSERT INTO user_milestones (user_id, milestone_key) VALUES (?, ?)", [req.user.user_id, milestoneId]);
    res.json({ success: true, completed: true });
  } catch (error) {
    console.error("Milestone update error:", error);
    res.status(500).json({ success: false, message: "Unable to update milestone." });
  }
});

router.get("/milestones", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query("SELECT milestone_key FROM user_milestones WHERE user_id = ? ORDER BY milestone_key", [req.user.user_id]);
    res.json({ success: true, completedMilestones: rows.map(row => row.milestone_key) });
  } catch (error) {
    console.error("Milestone fetch error:", error);
    res.status(500).json({ success: false, message: "Unable to fetch milestones." });
  }
});

// =====================================================
// GET STUDENT READINESS
// GET /api/student/readiness
// =====================================================

router.get("/readiness", authMiddleware, async (req, res) => {
  try {
    const data = await refreshAndPersistReadiness(req.user.user_id);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error("Readiness error:", error);
    res.status(500).json({ success: false, message: "Unable to calculate readiness." });
  }
});

router.get("/gaps", authMiddleware, async (req, res) => {
  try {
    const data = await refreshAndPersistReadiness(req.user.user_id);
    res.json({ success: true, ...data });
  } catch (error) {
    console.error("Skill gap error:", error);
    res.status(500).json({ success: false, message: "Unable to calculate skill gaps." });
  }
});


module.exports = router;
