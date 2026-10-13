const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const defaultSkills = [
  ["Data Structures & Algorithms", 65, 85, "Core CS"], ["Object-Oriented Programming (Java/C++)", 75, 80, "Core CS"],
  ["DBMS & SQL Queries", 80, 75, "Database"], ["Operating Systems & Linux", 60, 70, "Core CS"], ["Computer Networks", 50, 65, "Core CS"],
  ["React.js & Frontend", 72, 70, "Development"], ["Node.js & REST APIs", 55, 75, "Development"], ["Git, Docker & CI/CD", 35, 60, "DevOps"],
  ["System Design Fundamentals", 30, 65, "Architecture"]
];

const toSkillMap = (rows = []) => {
  const values = new Map(rows.map(row => [row.skill_name, Number(row.proficiency_score)]));
  return Object.fromEntries(defaultSkills.map(([name, initial, required, category]) => [
    name, { current: values.has(name) ? values.get(name) : initial, required, category }
  ]));
};
const scoreSkills = skills => {
  const entries = Object.values(skills);
  const target = entries.reduce((sum, skill) => sum + skill.required, 0);
  return target ? Math.round(entries.reduce((sum, skill) => sum + Math.min(skill.current, skill.required), 0) / target * 100) : 0;
};

async function initializeStudent(connection, userId, targetRole) {
  for (const [skillName, score] of defaultSkills) {
    await connection.query(
      `INSERT INTO user_skills (user_id, skill_id, proficiency_level, proficiency_score)
       SELECT ?, skill_id, ?, ? FROM skills WHERE skill_name = ?
       ON DUPLICATE KEY UPDATE proficiency_score = VALUES(proficiency_score)`,
      [userId, score >= 75 ? "Advanced" : score >= 50 ? "Intermediate" : "Beginner", score, skillName]
    );
  }
  const [roles] = await connection.query("SELECT role_id FROM career_roles WHERE role_name = ?", [targetRole]);
  if (roles.length) {
    await connection.query(
      "INSERT INTO roadmaps (user_id, role_id, roadmap_title, description) VALUES (?, ?, ?, ?)",
      [userId, roles[0].role_id, `${targetRole} Career Roadmap`, `Personalized roadmap for ${targetRole}`]
    );
  }
}

// ===============================
// REGISTER
// ERR-003 FIX: Now accepts 'name' (frontend field) in addition to 'full_name' (legacy field)
// ERR-025 FIX: Returns JWT token and user object that match frontend expectations
// ERR-026 FIX: User object fields now match what AuthContext and Dashboard expect
// ===============================
router.post("/register", async (req, res) => {
  let connection;
  try {
    // Accept either 'name' (frontend) or 'full_name' (legacy) — ERR-003
    const {
      name,
      full_name,
      email,
      password,
      phone,
      college,
      branch,
      semester,
      targetRole,
      graduation_year
    } = req.body;

    const studentName = typeof (name || full_name) === "string" ? (name || full_name).trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!studentName || !normalizedEmail || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }
    if (studentName.length > 100 || normalizedEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        password.length < 6 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({ success: false, message: "Please provide a valid name, email and password (6–72 bytes)." });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ success: false, message: "Authentication is temporarily unavailable." });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    const [existingUser] = await connection.query(
      "SELECT user_id FROM users WHERE email = ?",
      [normalizedEmail]
    );

    if (existingUser.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await connection.query(
      `INSERT INTO users
      (full_name, email, password_hash, phone, college, branch, graduation_year, semester, target_role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        studentName,
        normalizedEmail,
        password_hash,
        phone || null,
        college || null,
        branch || null,
        graduation_year || null,
        semester || 5,
        targetRole || "Software Developer"
      ]
    );

    await initializeStudent(connection, result.insertId, targetRole || "Software Developer");
    await connection.commit();

    // ERR-025 FIX: Generate and return a JWT token (previously missing)
    const token = jwt.sign(
      { user_id: result.insertId, email: normalizedEmail },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ERR-026 FIX: Return user fields matching frontend expectations
    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: result.insertId,
        name: studentName,
        email: normalizedEmail,
        semester: semester || "5",
        branch: branch || "Computer Science & Engineering",
        targetRole: targetRole || "Software Developer",
        college: college || "",
        cgpa: "0.0",
        readinessScore: scoreSkills(toSkillMap()),
        skills: toSkillMap(),
        completedMilestones: []
      }
    });

  } catch (error) {
    if (connection) {
      try { await connection.rollback(); } catch {}
    }
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ success: false, message: "Email already registered" });
    }
    console.error("Registration error:", error.code || error.name || "Error");
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  } finally {
    connection?.release();
  }
});


// ===============================
// LOGIN
// ERR-026 FIX: Response user object now matches frontend field name expectations
// ===============================
router.post("/login", async (req, res) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body;

    if (!email || typeof password !== "string" || email.length > 254 || Buffer.byteLength(password, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRET) return res.status(503).json({ success: false, message: "Authentication is temporarily unavailable." });

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const [skillRows] = await db.query(
      `SELECT s.skill_name, s.category, us.proficiency_score FROM user_skills us
       JOIN skills s ON s.skill_id = us.skill_id WHERE us.user_id = ?`, [user.user_id]
    );
    const [milestoneRows] = await db.query("SELECT milestone_key FROM user_milestones WHERE user_id = ?", [user.user_id]);

    // ERR-026 FIX: Return 'id' and 'name' instead of 'user_id' and 'full_name'
    // so the frontend AuthContext and Dashboard can consume them correctly.
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.user_id,
        name: user.full_name,
        email: user.email,
        semester: user.semester || "5",
        branch: user.branch || "",
        targetRole: user.target_role || "Software Developer",
        college: user.college || "",
        cgpa: user.cgpa || "0.0",
        readinessScore: scoreSkills(toSkillMap(skillRows)),
        skills: toSkillMap(skillRows),
        completedMilestones: milestoneRows.map(row => row.milestone_key)
      }
    });

  } catch (error) {
    console.error("Login error:", error.code || error.name || "Error");
    res.status(500).json({
      success: false,
      message: "Server error during login"
    });
  }
});


// ===============================
// PROFILE
// ===============================
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT user_id, full_name, email, phone, college, branch, graduation_year
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: rows[0]
    });

  } catch (error) {
    console.error("Profile error:", error.code || error.name || "Error");
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});


// ===============================
// EXPORT ROUTER
// ===============================
module.exports = router;
