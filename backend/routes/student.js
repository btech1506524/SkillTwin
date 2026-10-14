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
     WHERE u.user_id = ? AND crs.is_required = TRUE
     ORDER BY crs.importance DESC, s.skill_name`,
    [userId]
  );

  if (!rows.length) {
    return {
      targetRole: null,
      readinessScore: null,
      totalRequiredSkills: 0,
      missingCount: 0,
      belowTargetCount: 0,
      metCount: 0,
      hasProfiledSkills: false,
      skills: [],
      gaps: []
    };
  }

  const [[profiled]] = await db.query(
    "SELECT COUNT(*) AS total FROM user_skills WHERE user_id = ?",
    [userId]
  );
  const hasProfiledSkills = Number(profiled?.total || 0) > 0;

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
    readinessScore: hasProfiledSkills && totalRequired ? Math.round(totalCurrent / totalRequired * 100) : null,
    hasProfiledSkills,
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
  if (readiness.readinessScore !== null) {
    await db.query("UPDATE users SET readiness_score = ? WHERE user_id = ?", [readiness.readinessScore, userId]);
  }
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
        semester,
        target_role,
        cgpa,
        readiness_score,
        graduation_year,
        onboarding_completed_at,
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

// Resumeable profile and skill setup. Every personal record is scoped to the
// authenticated user; the client never supplies a user id.
router.get("/onboarding", authMiddleware, async (req, res) => {
  try {
    const [[profile]] = await db.query(
      `SELECT user_id, full_name, email, phone, college, branch, semester,
              target_role, cgpa, graduation_year, onboarding_completed_at
       FROM users WHERE user_id = ?`, [req.user.user_id]
    );
    if (!profile) return res.status(404).json({ success: false, message: "Student not found." });
    const [[savedSkills], [roles]] = await Promise.all([
      db.query(
        `SELECT s.skill_id AS skillId, s.skill_name AS skillName, s.category,
                s.description, us.proficiency_score AS proficiencyScore,
                us.years_experience AS yearsExperience
         FROM user_skills us JOIN skills s ON s.skill_id = us.skill_id
         WHERE us.user_id = ? ORDER BY s.category, s.skill_name`, [req.user.user_id]
      ),
      db.query("SELECT role_id AS id, role_name AS name, description FROM career_roles ORDER BY role_name")
    ]);
    res.json({
      success: true,
      complete: Boolean(profile.onboarding_completed_at),
      profile: {
        id: profile.user_id, name: profile.full_name, email: profile.email,
        phone: profile.phone || "", college: profile.college || "",
        branch: profile.branch || "", semester: String(profile.semester || ""),
        targetRole: profile.target_role || "", cgpa: profile.cgpa == null ? "" : String(profile.cgpa),
        graduationYear: profile.graduation_year == null ? "" : String(profile.graduation_year)
      },
      savedSkills: savedSkills.map(skill => ({
        ...skill,
        proficiencyScore: skill.proficiencyScore == null ? null : Number(skill.proficiencyScore),
        yearsExperience: skill.yearsExperience == null ? 0 : Number(skill.yearsExperience)
      })),
      roles
    });
  } catch (error) {
    console.error("Onboarding fetch error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to load your profile setup." });
  }
});

// Role-driven catalogue: required and optional skills are configured in the
// database, while saved proficiency is always scoped to the JWT user.
router.get("/onboarding/skills", authMiddleware, async (req, res) => {
  const roleId = Number(req.query.roleId);
  if (!Number.isSafeInteger(roleId) || roleId < 1) {
    return res.status(400).json({ success: false, message: "Choose a supported career role." });
  }
  try {
    const [rows] = await db.query(
      `SELECT s.skill_id AS skillId, s.skill_name AS skillName, s.category,
              s.description, crs.is_required AS isRequired,
              crs.required_level AS requiredLevel, crs.importance,
              us.proficiency_score AS proficiencyScore,
              us.years_experience AS yearsExperience
       FROM career_roles r
       JOIN career_role_skills crs ON crs.role_id = r.role_id
       JOIN skills s ON s.skill_id = crs.skill_id
       LEFT JOIN user_skills us ON us.skill_id = s.skill_id AND us.user_id = ?
       WHERE r.role_id = ?
       ORDER BY FIELD(s.category, 'common', 'core', 'soft', 'specialized'),
                crs.is_required DESC, s.skill_name`,
      [req.user.user_id, roleId]
    );
    const [roles] = await db.query("SELECT role_id AS id FROM career_roles WHERE role_id = ?", [roleId]);
    if (!roles.length) return res.status(404).json({ success: false, message: "Career role not found." });
    res.json({
      success: true,
      skills: rows.map(skill => ({
        ...skill,
        isRequired: Boolean(skill.isRequired),
        proficiencyScore: skill.proficiencyScore == null ? null : Number(skill.proficiencyScore),
        yearsExperience: skill.yearsExperience == null ? 0 : Number(skill.yearsExperience)
      }))
    });
  } catch (error) {
    console.error("Role skill catalogue error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to load skills for this career role." });
  }
});

router.put("/onboarding", authMiddleware, async (req, res) => {
  const body = req.body || {};
  const complete = body.complete !== false;
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const college = typeof body.college === "string" ? body.college.trim() : "";
  const branch = typeof body.branch === "string" ? body.branch.trim() : "";
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  const targetRole = typeof body.targetRole === "string" ? body.targetRole.trim() : "";
  const semester = body.semester === "" || body.semester == null ? null : Number(body.semester);
  const cgpa = body.cgpa === "" || body.cgpa == null ? null : Number(body.cgpa);
  const graduationYear = body.graduationYear === "" || body.graduationYear == null ? null : Number(body.graduationYear);
  const skillsProvided = body.skills == null || Array.isArray(body.skills);
  const skills = Array.isArray(body.skills) ? body.skills : [];
  if ((complete && (!name || !college || !branch || !semester || !targetRole)) ||
      name.length > 160 || college.length > 200 || branch.length > 160 || phone.length > 40 ||
      (semester !== null && (!Number.isInteger(semester) || semester < 1 || semester > 12)) || targetRole.length > 120 ||
      (cgpa !== null && (!Number.isFinite(cgpa) || cgpa < 0 || cgpa > 10)) ||
      (graduationYear !== null && (!Number.isInteger(graduationYear) || graduationYear < 2000 || graduationYear > 2200)) ||
      !skillsProvided || skills.length > 100) {
    return res.status(400).json({ success: false, message: "Add your name, college, branch, semester, and career goal." });
  }
  const skillIds = skills.map(skill => Number(skill?.skillId));
  if (skillIds.some((id, i) => !Number.isSafeInteger(id) || id < 1 || skillIds.indexOf(id) !== i) ||
      skills.some(skill => !Number.isInteger(Number(skill?.proficiencyScore)) || Number(skill.proficiencyScore) < 0 || Number(skill.proficiencyScore) > 100 ||
        !Number.isFinite(Number(skill?.yearsExperience ?? 0)) || Number(skill.yearsExperience ?? 0) < 0 || Number(skill.yearsExperience ?? 0) > 80)) {
    return res.status(400).json({ success: false, message: "Choose valid skills and proficiency ratings from 0 to 100." });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [role] = targetRole ? await connection.query("SELECT role_id FROM career_roles WHERE role_name = ?", [targetRole]) : [[]];
    if (targetRole && !role.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Choose a supported career goal." });
    }
    const [catalog] = skillIds.length && role.length ? await connection.query(
      `SELECT crs.skill_id FROM career_role_skills crs
       WHERE crs.role_id = ? AND crs.skill_id IN (${skillIds.map(() => "?").join(",")})`,
      [role[0].role_id, ...skillIds]
    ) : [[]];
    if (skillIds.length && !role.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Choose a supported career goal before selecting skills." });
    }
    if (catalog.length !== skillIds.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "One or more selected skills are unavailable." });
    }
    await connection.query(
      `UPDATE users SET full_name = IF(? = '', full_name, ?), phone = ?, college = ?, branch = ?, semester = ?,
         target_role = ?, cgpa = ?, graduation_year = ?,
         onboarding_completed_at = CASE WHEN ? THEN COALESCE(onboarding_completed_at, CURRENT_TIMESTAMP) ELSE onboarding_completed_at END
       WHERE user_id = ?`,
      [name, name, phone || null, college || null, branch || null, semester, targetRole || null, cgpa, graduationYear, complete, req.user.user_id]
    );
    // Onboarding is an explicit skill profile submission; replace only this
    // student's current entries so deselected starter choices cannot linger.
    await connection.query("DELETE FROM user_skills WHERE user_id = ?", [req.user.user_id]);
    for (const skill of skills) {
      const score = Number(skill.proficiencyScore);
      const level = score >= 100 ? "Expert" : score >= 75 ? "Advanced" : score >= 50 ? "Intermediate" : "Beginner";
      await connection.query(
        `INSERT INTO user_skills (user_id, skill_id, proficiency_level, proficiency_score, years_experience)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.user_id, Number(skill.skillId), level, score, Number(skill.yearsExperience ?? 0)]
      );
    }
    await connection.query("UPDATE roadmaps SET is_current = FALSE WHERE user_id = ?", [req.user.user_id]);
    await connection.commit();
    const readiness = await refreshAndPersistReadiness(req.user.user_id);
    res.json({ success: true, complete, readinessScore: readiness.readinessScore });
  } catch (error) {
    await connection.rollback().catch(() => {});
    console.error("Onboarding save error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to save your profile setup." });
  } finally {
    connection.release();
  }
});


// =====================================================
// GET STUDENT SKILLS
// GET /api/student/skills
// =====================================================

router.get("/skills/catalog", authMiddleware, async (req, res) => {
  try {
    const category = typeof req.query.category === "string" ? req.query.category : "";
    const allowedCategories = ["common", "core", "soft", "specialized"];
    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({ success: false, message: "Choose a supported skill category." });
    }
    const [rows] = await db.query(
      `SELECT skill_id AS skillId, skill_name AS skillName, category, description
       FROM skills ${category ? "WHERE category = ?" : ""}
       ORDER BY FIELD(category, 'common', 'core', 'soft', 'specialized'), skill_name`,
      category ? [category] : []
    );
    res.json({ success: true, skills: rows });
  } catch (error) {
    console.error("Skill catalogue error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to load the skill catalogue." });
  }
});

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

    const { skill_id, skillName, proficiency_level, proficiency_score, currentLevel, years_experience } = req.body || {};
    let resolvedSkillId = skill_id;
    if (!resolvedSkillId && skillName) {
      if (typeof skillName !== "string" || !skillName.trim() || skillName.length > 160) {
        return res.status(400).json({ success: false, message: "skillName must be a valid skill name." });
      }
      const [matches] = await db.query("SELECT skill_id FROM skills WHERE skill_name = ?", [skillName.trim()]);
      if (matches.length) resolvedSkillId = matches[0].skill_id;
    }

    if (!resolvedSkillId) {
      return res.status(400).json({
        success: false,
        message: "A valid skill_id or skillName is required."
      });
    }
    resolvedSkillId = Number(resolvedSkillId);
    if (!Number.isSafeInteger(resolvedSkillId) || resolvedSkillId < 1) {
      return res.status(400).json({ success: false, message: "A valid skill_id or skillName is required." });
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
    if (typeof level !== "string" || !Object.hasOwn(levelScores, level)) {
      return res.status(400).json({ success: false, message: "Invalid proficiency level." });
    }

    const [skill] = await db.query(
      `SELECT s.skill_id FROM skills s
       JOIN career_role_skills crs ON crs.skill_id = s.skill_id
       JOIN career_roles r ON r.role_id = crs.role_id
       JOIN users u ON u.target_role = r.role_name
       WHERE s.skill_id = ? AND u.user_id = ?`,
      [resolvedSkillId, req.user.user_id]
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
    await db.query("UPDATE roadmaps SET is_current = FALSE WHERE user_id = ?", [req.user.user_id]);

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

router.delete("/skills/:skillId", authMiddleware, async (req, res) => {
  const skillId = Number(req.params.skillId);
  if (!Number.isSafeInteger(skillId) || skillId < 1) {
    return res.status(400).json({ success: false, message: "A valid skill id is required." });
  }
  try {
    const [result] = await db.query("DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?", [req.user.user_id, skillId]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "This skill is not in your profile." });
    await db.query("UPDATE roadmaps SET is_current = FALSE WHERE user_id = ?", [req.user.user_id]);
    const readiness = await refreshAndPersistReadiness(req.user.user_id);
    res.json({ success: true, readinessScore: readiness.readinessScore });
  } catch (error) {
    console.error("Skill removal error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to remove this skill." });
  }
});


// =====================================================
// GET TARGET CAREER ROLE
// GET /api/student/target-role
// =====================================================

router.get("/target-role", authMiddleware, async (req, res) => {

  try {

    const [rows] = await db.query(
      `SELECT r.role_id, r.role_name, r.description, r.average_salary, r.demand_level
       FROM users u
       JOIN career_roles r ON r.role_name = u.target_role
       WHERE u.user_id = ?`,
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
  let connection;
  try {
    let { role_id } = req.body || {};
    const requestedRole = req.body?.targetRole;
    if (requestedRole !== undefined && (typeof requestedRole !== "string" || !requestedRole.trim() || requestedRole.trim().length > 120)) {
      return res.status(400).json({ success: false, message: "targetRole must be a valid role name." });
    }
    if (!role_id && requestedRole) {
      const [matches] = await db.query("SELECT role_id FROM career_roles WHERE role_name = ?", [requestedRole.trim()]);
      if (matches.length) role_id = matches[0].role_id;
    }

    if (!role_id) {
      return res.status(400).json({
        success: false,
        message: "role_id is required."
      });
    }

    const normalizedRoleId = Number(role_id);
    if (!Number.isSafeInteger(normalizedRoleId) || normalizedRoleId < 1) {
      return res.status(400).json({ success: false, message: "A valid role_id is required." });
    }

    const [roles] = await db.query(
      "SELECT * FROM career_roles WHERE role_id = ?",
      [normalizedRoleId]
    );

    if (roles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Career role not found."
      });
    }

    const role = roles[0];

    connection = await db.getConnection();
    await connection.beginTransaction();
    const [users] = await connection.query("SELECT user_id FROM users WHERE user_id = ? FOR UPDATE", [req.user.user_id]);
    if (!users.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Student not found." });
    }
    await connection.query("UPDATE users SET target_role = ? WHERE user_id = ?", [role.role_name, req.user.user_id]);
    await connection.query(
      `DELETE us FROM user_skills us
       WHERE us.user_id = ? AND NOT EXISTS (
         SELECT 1 FROM career_role_skills crs
         WHERE crs.role_id = ? AND crs.skill_id = us.skill_id
       )`,
      [req.user.user_id, normalizedRoleId]
    );
    await connection.query("UPDATE roadmaps SET is_current = FALSE WHERE user_id = ?", [req.user.user_id]);
    await connection.commit();
    const readiness = await refreshAndPersistReadiness(req.user.user_id);

    res.json({
      success: true,
      message: "Target role updated successfully.",
      targetRole: role,
      readinessScore: readiness.readinessScore
    });

  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }

    console.error("Target role update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error."
    });

  } finally {
    connection?.release();
  }
});


// =====================================================
// GET STUDENT READINESS
// GET /api/student/readiness
// =====================================================

router.put("/milestones", authMiddleware, async (req, res) => {
  try {
    const { milestoneId } = req.body || {};
    if (typeof milestoneId !== "string" || !milestoneId.trim() || milestoneId.length > 80) return res.status(400).json({ success: false, message: "milestoneId must be between 1 and 80 characters." });
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
