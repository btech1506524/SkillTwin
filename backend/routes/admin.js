const express = require("express");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { isHiddenAdminColumn } = require("../lib/security");

const router = express.Router();
router.use(authMiddleware, adminMiddleware);

const tableNamePattern = /^[A-Za-z0-9_]+$/;
const quoteIdentifier = value => `\`${String(value).replace(/`/g, "``")}\``;
const parsePositiveInt = (value, fallback, max) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

function validUserId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function getUserFilters(searchValue, roleValue) {
  const search = typeof searchValue === "string" ? searchValue.trim().slice(0, 120) : "";
  const role = ["student", "admin"].includes(roleValue) ? roleValue : null;
  const conditions = [];
  const values = [];
  if (search) {
    const term = `%${search}%`;
    conditions.push("(full_name LIKE ? OR email LIKE ? OR college LIKE ? OR target_role LIKE ?)");
    values.push(term, term, term, term);
  }
  if (role) {
    conditions.push("account_role = ?");
    values.push(role);
  }
  return { search, role, where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "", values };
}

function csvCell(value) {
  let text = value == null ? "" : String(value);
  if (/^[\t\r\n ]*[=+@-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function parseAuditDetails(value) {
  if (typeof value !== "string") return value || null;
  try { return JSON.parse(value); } catch { return null; }
}

router.get("/overview", async (req, res) => {
  try {
    const [users, roles, skills, userSkills, roadmaps, assessments, attempts, questions, roadmapTasks] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM users"),
      db.query("SELECT COUNT(*) AS total FROM career_roles"),
      db.query("SELECT COUNT(*) AS total FROM skills"),
      db.query("SELECT COUNT(*) AS total FROM user_skills"),
      db.query("SELECT COUNT(*) AS total FROM roadmaps"),
      db.query("SELECT COUNT(*) AS total FROM assessments"),
      db.query("SELECT COUNT(*) AS total FROM assessment_results"),
      db.query("SELECT COUNT(*) AS total FROM assessment_questions"),
      db.query("SELECT COUNT(*) AS total FROM roadmap_milestones")
    ]);
    const [userRoles] = await db.query(
      "SELECT account_role AS accountRole, COUNT(*) AS total FROM users GROUP BY account_role"
    );
    const [databaseInfo] = await db.query("SELECT DATABASE() AS databaseName, VERSION() AS serverVersion");
    const [[newUsersByDay], [readinessBands], [topRoles], [recentActivity]] = await Promise.all([
      db.query(
        `SELECT DATE_FORMAT(created_at, '%Y-%m-%d') AS day, COUNT(*) AS total
         FROM users WHERE account_role = 'student' AND created_at >= CURRENT_DATE - INTERVAL 29 DAY
         GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') ORDER BY day`
      ),
      db.query(
        `SELECT CASE WHEN readiness_score < 40 THEN '0–39'
                     WHEN readiness_score < 60 THEN '40–59'
                     WHEN readiness_score < 80 THEN '60–79' ELSE '80–100' END AS band,
                COUNT(*) AS total
         FROM users WHERE account_role = 'student' GROUP BY band ORDER BY MIN(readiness_score)`
      ),
      db.query(
        `SELECT target_role AS roleName, COUNT(*) AS total FROM users
         WHERE account_role = 'student' GROUP BY target_role ORDER BY total DESC, roleName LIMIT 5`
      ),
      db.query(
        `SELECT l.audit_id AS id, l.action, l.details, l.created_at AS createdAt,
                actor.full_name AS actorName, target.full_name AS targetName
         FROM admin_audit_log l
         LEFT JOIN users actor ON actor.user_id = l.actor_user_id
         LEFT JOIN users target ON target.user_id = l.target_user_id
         ORDER BY l.created_at DESC, l.audit_id DESC LIMIT 8`
      )
    ]);
    const value = result => Number(result[0][0].total);
    res.json({
      success: true,
      database: databaseInfo[0],
      stats: {
        users: value(users),
        admins: Number(userRoles.find(row => row.accountRole === "admin")?.total || 0),
        students: Number(userRoles.find(row => row.accountRole === "student")?.total || 0),
        roles: value(roles),
        skills: value(skills),
        userSkills: value(userSkills),
        roadmaps: value(roadmaps),
        roadmapTasks: value(roadmapTasks),
        assessments: value(assessments),
        assessmentQuestions: value(questions),
        assessmentAttempts: value(attempts)
      },
      analytics: {
        newUsersByDay: newUsersByDay.map(row => ({ day: row.day, total: Number(row.total) })),
        readinessBands: readinessBands.map(row => ({ band: row.band, total: Number(row.total) })),
        topRoles: topRoles.map(row => ({ roleName: row.roleName, total: Number(row.total) }))
      },
      recentActivity: recentActivity.map(row => ({ ...row, details: parseAuditDetails(row.details) }))
    });
  } catch (error) {
    console.error("Admin overview error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to load the admin overview." });
  }
});

router.get("/activity", async (req, res) => {
  const limit = parsePositiveInt(req.query.limit, 50, 100);
  try {
    const [rows] = await db.query(
      `SELECT l.audit_id AS id, l.action, l.details, l.created_at AS createdAt,
              actor.full_name AS actorName, target.full_name AS targetName,
              target.email AS targetEmail
       FROM admin_audit_log l
       LEFT JOIN users actor ON actor.user_id = l.actor_user_id
       LEFT JOIN users target ON target.user_id = l.target_user_id
       ORDER BY l.created_at DESC, l.audit_id DESC LIMIT ?`, [limit]
    );
    res.json({ success: true, activity: rows.map(row => ({ ...row, details: parseAuditDetails(row.details) })) });
  } catch (error) {
    console.error("Admin activity error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to load administrator activity." });
  }
});

router.get("/users", async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, 100000);
    const limit = parsePositiveInt(req.query.limit, 25, 100);
    const { where, values } = getUserFilters(req.query.search, req.query.role);
    const [[countRows], [users]] = await Promise.all([
      db.query(`SELECT COUNT(*) AS total FROM users ${where}`, values),
      db.query(
        `SELECT user_id AS id, full_name AS name, email, phone, college, branch,
                semester, target_role AS targetRole, readiness_score AS readinessScore,
                graduation_year AS graduationYear, account_role AS accountRole, created_at AS createdAt
         FROM users ${where} ORDER BY created_at DESC, user_id DESC LIMIT ? OFFSET ?`,
        [...values, limit, (page - 1) * limit]
      )
    ]);
    res.json({ success: true, users, pagination: { page, limit, total: Number(countRows[0].total) } });
  } catch (error) {
    console.error("Admin user list error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to load users." });
  }
});

router.get("/users/export", async (req, res) => {
  try {
    const { where, values } = getUserFilters(req.query.search, req.query.role);
    const [users] = await db.query(
      `SELECT full_name AS name, email, college, branch, semester,
              target_role AS targetRole, readiness_score AS readinessScore,
              account_role AS accountRole, created_at AS createdAt
       FROM users ${where} ORDER BY created_at DESC, user_id DESC LIMIT 10000`, values
    );
    const columns = ["name", "email", "college", "branch", "semester", "targetRole", "readinessScore", "accountRole", "createdAt"];
    const csv = [columns.join(","), ...users.map(user => columns.map(column => csvCell(user[column])).join(","))].join("\r\n");
    const stamp = new Date().toISOString().slice(0, 10);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="skilltwin-users-${stamp}.csv"`);
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    console.error("Admin user export error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to export user accounts." });
  }
});

router.get("/users/:userId", async (req, res) => {
  const userId = validUserId(req.params.userId);
  if (!userId) return res.status(400).json({ success: false, message: "Invalid user ID." });
  try {
    const [[users], [skills], [roadmaps], [attempts], [milestones]] = await Promise.all([
      db.query(
        `SELECT user_id AS id, full_name AS name, email, phone, college, branch, semester,
                target_role AS targetRole, cgpa, readiness_score AS readinessScore,
                graduation_year AS graduationYear, account_role AS accountRole, created_at AS createdAt
         FROM users WHERE user_id = ?`, [userId]
      ),
      db.query(
        `SELECT s.skill_name AS skillName, s.category, us.proficiency_level AS proficiencyLevel,
                us.proficiency_score AS proficiencyScore, us.years_experience AS yearsExperience,
                us.last_updated AS lastUpdated
         FROM user_skills us JOIN skills s ON s.skill_id = us.skill_id
         WHERE us.user_id = ? ORDER BY s.skill_name`, [userId]
      ),
      db.query(
        `SELECT r.roadmap_id AS id, r.roadmap_title AS title, r.status, r.is_current AS isCurrent,
                r.created_at AS createdAt, cr.role_name AS roleName,
                COUNT(rm.milestone_id) AS taskCount,
                SUM(rm.status = 'Completed') AS completedTasks
         FROM roadmaps r JOIN career_roles cr ON cr.role_id = r.role_id
         LEFT JOIN roadmap_milestones rm ON rm.roadmap_id = r.roadmap_id
         WHERE r.user_id = ? GROUP BY r.roadmap_id ORDER BY r.created_at DESC LIMIT 25`, [userId]
      ),
      db.query(
        `SELECT ar.result_id AS id, a.title AS assessment, ar.score, ar.percentage,
                ar.correct_answers AS correctAnswers, ar.question_count AS questionCount,
                ar.completed_at AS completedAt
         FROM assessment_results ar JOIN assessments a ON a.assessment_id = ar.assessment_id
         WHERE ar.user_id = ? ORDER BY ar.completed_at DESC LIMIT 25`, [userId]
      ),
      db.query("SELECT milestone_key AS milestoneKey, completed_at AS completedAt FROM user_milestones WHERE user_id = ? ORDER BY completed_at DESC", [userId])
    ]);
    if (!users.length) return res.status(404).json({ success: false, message: "User not found." });
    res.json({ success: true, user: users[0], skills, roadmaps, assessmentAttempts: attempts, completedMilestones: milestones });
  } catch (error) {
    console.error("Admin user detail error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to load this user." });
  }
});

router.patch("/users/:userId/role", async (req, res) => {
  const userId = validUserId(req.params.userId);
  const accountRole = req.body?.accountRole;
  if (!userId) return res.status(400).json({ success: false, message: "Invalid user ID." });
  if (!["student", "admin"].includes(accountRole)) {
    return res.status(400).json({ success: false, message: "accountRole must be student or admin." });
  }
  if (userId === req.user.user_id) return res.status(409).json({ success: false, message: "You cannot change your own administrator role." });

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query("SELECT user_id FROM users WHERE account_role = 'admin' FOR UPDATE");
    const [targetRows] = await connection.query("SELECT user_id, account_role FROM users WHERE user_id = ? FOR UPDATE", [userId]);
    if (!targetRows.length) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "User not found." });
    }
    if (targetRows[0].account_role === "admin" && accountRole === "student") {
      const [[adminCount]] = await connection.query("SELECT COUNT(*) AS total FROM users WHERE account_role = 'admin'");
      if (Number(adminCount.total) <= 1) {
        await connection.rollback();
        return res.status(409).json({ success: false, message: "At least one administrator account must remain." });
      }
    }
    await connection.query("UPDATE users SET account_role = ? WHERE user_id = ?", [accountRole, userId]);
    await connection.query(
      `INSERT INTO admin_audit_log (actor_user_id, target_user_id, action, details)
       VALUES (?, ?, 'user.role.changed', JSON_OBJECT('fromRole', ?, 'toRole', ?))`,
      [req.user.user_id, userId, targetRows[0].account_role, accountRole]
    );
    await connection.commit();
    res.json({ success: true, userId, accountRole });
  } catch (error) {
    try { await connection.rollback(); } catch {}
    console.error("Admin role update error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to update the account role." });
  } finally {
    connection.release();
  }
});

router.get("/database/tables", async (req, res) => {
  try {
    const [tables] = await db.query(
      `SELECT TABLE_NAME AS name, TABLE_COMMENT AS description
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`
    );
    const enriched = await Promise.all(tables.map(async table => {
      const safeTableName = quoteIdentifier(table.name);
      const [[counts]] = await db.query(`SELECT COUNT(*) AS total FROM ${safeTableName}`);
      const [[columnCount]] = await db.query(
        `SELECT COUNT(*) AS total FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
        [table.name]
      );
      return { ...table, rows: Number(counts.total), columns: Number(columnCount.total) };
    }));
    res.json({ success: true, tables: enriched });
  } catch (error) {
    console.error("Admin database table list error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to inspect application database tables." });
  }
});

router.get("/database/tables/:tableName", async (req, res) => {
  const { tableName } = req.params;
  if (!tableNamePattern.test(tableName)) return res.status(400).json({ success: false, message: "Invalid table name." });
  const page = parsePositiveInt(req.query.page, 1, 100000);
  const limit = parsePositiveInt(req.query.limit, 25, 100);
  try {
    const [[table]] = await db.query(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE' AND TABLE_NAME = ?`, [tableName]
    );
    if (!table) return res.status(404).json({ success: false, message: "Table not found in the application database." });
    const [columns] = await db.query(
      `SELECT COLUMN_NAME AS name, DATA_TYPE AS dataType, COLUMN_KEY AS columnKey, ORDINAL_POSITION AS position
       FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? ORDER BY ORDINAL_POSITION`,
      [tableName]
    );
    const visibleColumns = columns.filter(column => !isHiddenAdminColumn(column.name));
    if (!visibleColumns.length) return res.json({ success: true, table: tableName, columns: [], rows: [], pagination: { page: 1, limit, total: 0 } });
    const safeTableName = quoteIdentifier(table.name);
    const visibleColumnList = visibleColumns.map(column => quoteIdentifier(column.name)).join(", ");
    const primaryKeys = columns.filter(column => column.columnKey === "PRI");
    const orderBy = primaryKeys.length ? `ORDER BY ${primaryKeys.map(column => quoteIdentifier(column.name)).join(", ")}` : "";
    const [[countRows]] = await db.query(`SELECT COUNT(*) AS total FROM ${safeTableName}`);
    const total = Number(countRows.total);
    const actualPage = total ? Math.min(page, Math.ceil(total / limit)) : 1;
    const [rows] = await db.query(
      `SELECT ${visibleColumnList} FROM ${safeTableName} ${orderBy} LIMIT ? OFFSET ?`,
      [limit, (actualPage - 1) * limit]
    );
    res.json({
      success: true,
      table: tableName,
      columns: visibleColumns.map(column => ({ name: column.name, dataType: column.dataType, primaryKey: column.columnKey === "PRI" })),
      rows,
      pagination: { page: actualPage, limit, total }
    });
  } catch (error) {
    console.error("Admin database table data error:", error.code || error.name || "Error");
    res.status(500).json({ success: false, message: "Unable to read this application table." });
  }
});

module.exports = router;
