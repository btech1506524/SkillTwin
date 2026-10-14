const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();
router.use(authMiddleware);

const levelScores = { Beginner: 25, Intermediate: 50, Advanced: 75, Expert: 100 };
const importanceScores = { Low: 1, Medium: 2, High: 3, Critical: 4 };

async function hasProfiledSkills(userId) {
  const [[row]] = await db.query("SELECT COUNT(*) AS total FROM user_skills WHERE user_id = ?", [userId]);
  return Number(row?.total || 0) > 0;
}

async function getRoleGaps(connection, userId) {
  const [rows] = await connection.query(
    `SELECT r.role_id AS roleId, r.role_name AS roleName,
            s.skill_id AS skillId, s.skill_name AS skillName, s.category, s.description AS skillDescription,
            crs.required_level AS requiredLevel, crs.importance,
            profile.proficiency_score AS currentScore, profile.user_id AS profileUserId
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
  return rows.map(row => {
    const targetScore = levelScores[row.requiredLevel] || 50;
    const missing = row.profileUserId === null;
    const currentScore = missing ? 0 : Number(row.currentScore || 0);
    const gap = Math.max(0, targetScore - currentScore);
    const importance = importanceScores[row.importance] || 1;
    return {
      ...row,
      targetScore,
      currentScore,
      gap,
      missing,
      importance,
      priorityScore: gap * importance + (missing ? 100 : 0)
    };
  }).filter(skill => skill.gap > 0)
    .sort((a, b) => b.priorityScore - a.priorityScore || b.gap - a.gap || a.skillName.localeCompare(b.skillName));
}

async function generateRoadmap(userId, { regenerate = false } = {}) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query(
      "SELECT target_role AS targetRole FROM users WHERE user_id = ? FOR UPDATE",
      [userId]
    );
    if (!users.length) {
      await connection.rollback();
      return null;
    }
    if (!regenerate) {
      const [existing] = await connection.query(
        `SELECT roadmap_id AS id FROM roadmaps
         WHERE user_id = ? AND is_current = TRUE
           AND role_id = (SELECT role_id FROM career_roles WHERE role_name = ?)
         ORDER BY roadmap_id DESC LIMIT 1`,
        [userId, users[0].targetRole]
      );
      if (existing.length) {
        await connection.commit();
        return Number(existing[0].id);
      }
    }
    const [roles] = await connection.query(
      "SELECT role_id AS roleId, role_name AS roleName FROM career_roles WHERE role_name = ?",
      [users[0].targetRole]
    );
    if (!roles.length) {
      await connection.rollback();
      return null;
    }
    const role = roles[0];
    const gaps = await getRoleGaps(connection, userId);
    await connection.query("UPDATE roadmaps SET is_current = FALSE WHERE user_id = ?", [userId]);
    const [created] = await connection.query(
      `INSERT INTO roadmaps (user_id, role_id, roadmap_title, description, status, is_current)
       VALUES (?, ?, ?, ?, ?, TRUE)`,
      [userId, role.roleId, `${role.roleName} Learning Roadmap`,
        `Prioritized learning milestones generated from your ${role.roleName} role requirements and current skill profile.`,
        gaps.length ? "Not Started" : "Completed"]
    );

    for (const [index, skill] of gaps.entries()) {
      const title = `Build ${skill.skillName} proficiency`;
      const outcome = `Reach ${skill.requiredLevel} proficiency in ${skill.skillName} by completing a focused learning module and a practical exercise, then update your skill profile.`;
      const description = skill.missing
        ? `${skill.skillName} is not recorded in your profile. The ${role.roleName} role expects ${skill.requiredLevel} (${skill.targetScore}/100).`
        : `Your current ${skill.skillName} score is ${skill.currentScore}/100; the ${role.roleName} target is ${skill.requiredLevel} (${skill.targetScore}/100). Close the ${skill.gap}-point gap.`;
      const estimatedHours = Math.max(2, Math.ceil(skill.gap / 5) * 2);
      await connection.query(
        `INSERT INTO roadmap_milestones
          (roadmap_id, skill_id, sequence_no, title, outcome, description,
           priority_score, estimated_hours, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Planned')`,
        [created.insertId, skill.skillId, index + 1, title, outcome, description,
          skill.priorityScore, estimatedHours]
      );
    }
    await connection.commit();
    return Number(created.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function loadCurrentRoadmap(userId) {
  const [roadmaps] = await db.query(
    `SELECT rm.roadmap_id AS id, rm.roadmap_title AS title, rm.description,
            rm.status, rm.created_at AS generatedAt, r.role_name AS roleName
     FROM roadmaps rm JOIN career_roles r ON r.role_id = rm.role_id
     JOIN users u ON u.user_id = rm.user_id
     WHERE rm.user_id = ? AND rm.is_current = TRUE AND r.role_name = u.target_role
     ORDER BY rm.created_at DESC, rm.roadmap_id DESC LIMIT 1`,
    [userId]
  );
  if (!roadmaps.length) return null;

  const roadmap = roadmaps[0];
  const [milestones] = await db.query(
    `SELECT m.milestone_id AS id, m.sequence_no AS sequence,
            m.title, m.outcome, m.description, m.priority_score AS priorityScore,
            m.estimated_hours AS estimatedHours, m.status, m.completed_at AS completedAt,
            s.skill_name AS skillName, s.category
     FROM roadmap_milestones m JOIN skills s ON s.skill_id = m.skill_id
     WHERE m.roadmap_id = ? ORDER BY m.sequence_no`,
    [roadmap.id]
  );
  const completedCount = milestones.filter(item => item.status === "Completed").length;
  const inProgressCount = milestones.filter(item => item.status === "In Progress").length;
  const plannedCount = milestones.filter(item => item.status === "Planned").length;
  const totalCount = milestones.length;
  return {
    ...roadmap,
    milestones: milestones.map(item => ({ ...item, sequence: Number(item.sequence), priorityScore: Number(item.priorityScore), estimatedHours: Number(item.estimatedHours) })),
    progress: {
      total: totalCount,
      completed: completedCount,
      inProgress: inProgressCount,
      planned: plannedCount,
      percentage: totalCount ? Math.round(completedCount / totalCount * 100) : 100,
      status: completedCount === totalCount ? "Completed" : completedCount || inProgressCount ? "In Progress" : "Not Started"
    }
  };
}

router.get("/progress", async (req, res) => {
  try {
    if (!(await hasProfiledSkills(req.user.user_id))) {
      return res.json({ success: true, roleName: null, progress: null, readinessScore: null });
    }
    let roadmap = await loadCurrentRoadmap(req.user.user_id);
    if (!roadmap) {
      const roadmapId = await generateRoadmap(req.user.user_id);
      if (!roadmapId) return res.status(404).json({ success: false, message: "Choose a supported target role before loading progress." });
      roadmap = await loadCurrentRoadmap(req.user.user_id);
    }
    const [users] = await db.query("SELECT readiness_score AS readinessScore FROM users WHERE user_id = ?", [req.user.user_id]);
    res.json({ success: true, roleName: roadmap.roleName, progress: roadmap.progress, readinessScore: Number(users[0]?.readinessScore || 0) });
  } catch (error) {
    console.error("Roadmap progress error:", error);
    res.status(500).json({ success: false, message: "Unable to load your progress." });
  }
});

router.get("/", async (req, res) => {
  try {
    if (!(await hasProfiledSkills(req.user.user_id))) return res.json({ success: true, roadmap: null });
    let roadmap = await loadCurrentRoadmap(req.user.user_id);
    if (!roadmap) {
      const roadmapId = await generateRoadmap(req.user.user_id);
      if (!roadmapId) return res.status(404).json({ success: false, message: "Choose a supported target role before generating a roadmap." });
      roadmap = await loadCurrentRoadmap(req.user.user_id);
    }
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error("Roadmap fetch error:", error);
    res.status(500).json({ success: false, message: "Unable to load your learning roadmap." });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const roadmapId = await generateRoadmap(req.user.user_id, { regenerate: true });
    if (!roadmapId) return res.status(404).json({ success: false, message: "Choose a supported target role before generating a roadmap." });
    const roadmap = await loadCurrentRoadmap(req.user.user_id);
    res.status(201).json({ success: true, roadmap });
  } catch (error) {
    console.error("Roadmap generation error:", error);
    res.status(500).json({ success: false, message: "Unable to generate your learning roadmap." });
  }
});

router.put("/milestones/:milestoneId", async (req, res) => {
  const allowedStatuses = new Set(["Planned", "In Progress", "Completed"]);
  const { status } = req.body || {};
  if (!allowedStatuses.has(status)) return res.status(400).json({ success: false, message: "Choose Planned, In Progress, or Completed." });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [owned] = await connection.query(
      `SELECT m.roadmap_id FROM roadmap_milestones m
       JOIN roadmaps r ON r.roadmap_id = m.roadmap_id
       WHERE m.milestone_id = ? AND r.user_id = ? AND r.is_current = TRUE FOR UPDATE`,
      [req.params.milestoneId, req.user.user_id]
    );
    if (!owned.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Roadmap milestone not found." });
    }
    const roadmapId = owned[0].roadmap_id;
    await connection.query(
      `UPDATE roadmap_milestones SET status = ?,
         completed_at = CASE WHEN ? = 'Completed' THEN COALESCE(completed_at, CURRENT_TIMESTAMP) ELSE NULL END
       WHERE milestone_id = ?`,
      [status, status, req.params.milestoneId]
    );
    const [[counts]] = await connection.query(
      `SELECT COUNT(*) AS total,
              SUM(status = 'Completed') AS completed,
              SUM(status = 'In Progress') AS inProgress
       FROM roadmap_milestones WHERE roadmap_id = ?`,
      [roadmapId]
    );
    const roadmapStatus = Number(counts.total) > 0 && Number(counts.completed) === Number(counts.total)
      ? "Completed"
      : Number(counts.completed) > 0 || Number(counts.inProgress) > 0
        ? "In Progress"
        : "Not Started";
    await connection.query("UPDATE roadmaps SET status = ? WHERE roadmap_id = ?", [roadmapStatus, roadmapId]);
    await connection.commit();
    res.json({ success: true, status, roadmapStatus });
  } catch (error) {
    await connection.rollback();
    console.error("Roadmap milestone update error:", error);
    res.status(500).json({ success: false, message: "Unable to update this milestone." });
  } finally {
    connection.release();
  }
});

module.exports = router;
