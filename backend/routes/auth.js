const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const toSkillMap = (rows = []) => Object.fromEntries(rows.map(row => [row.skill_name, {
  current: Number(row.proficiency_score),
  required: 0,
  category: row.category,
  missing: false
}]));

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
    } = req.body || {};

    const studentName = typeof (name || full_name) === "string" ? (name || full_name).trim() : "";
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const selectedRole = typeof targetRole === "string" && targetRole.trim() ? targetRole.trim() : "Software Developer";
    const selectedSemester = Number(semester ?? 5);

    if (!studentName || !normalizedEmail || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }
    if (studentName.length > 160 || normalizedEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) ||
        password.length < 6 || Buffer.byteLength(password, "utf8") > 72 ||
        !Number.isInteger(selectedSemester) || selectedSemester < 3 || selectedSemester > 8 ||
        (branch != null && (typeof branch !== "string" || branch.length > 160)) ||
        (college != null && (typeof college !== "string" || college.length > 200)) ||
        (phone != null && (typeof phone !== "string" || phone.length > 40))) {
      return res.status(400).json({ success: false, message: "Please provide valid profile details, a semester from 3 to 8, and a password of 6–72 bytes." });
    }
    if (!process.env.JWT_SECRET) {
      return res.status(503).json({ success: false, message: "Authentication is temporarily unavailable." });
    }

    const [roleRows] = await db.query("SELECT role_id FROM career_roles WHERE role_name = ?", [selectedRole]);
    if (!roleRows.length) return res.status(400).json({ success: false, message: "Choose a supported target role." });

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
        selectedSemester,
        selectedRole
      ]
    );

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
        semester: String(selectedSemester),
        branch: branch || "Computer Science & Engineering",
        targetRole: selectedRole,
        accountRole: "student",
        college: college || "",
        cgpa: "",
        readinessScore: 0,
        skills: {},
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
    const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const { password } = req.body || {};

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

    if (user.account_role === "admin") {
      try {
        await db.query(
          "INSERT INTO admin_audit_log (actor_user_id, action) VALUES (?, 'admin.login')",
          [user.user_id]
        );
      } catch (error) {
        console.error("Admin login audit error:", error.code || error.name || "Error");
      }
    }

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
        accountRole: user.account_role || "student",
        college: user.college || "",
        cgpa: user.cgpa == null ? "" : String(user.cgpa),
        readinessScore: Number(user.readiness_score || 0),
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
      `SELECT user_id, full_name, email, phone, college, branch, semester,
              target_role, cgpa, readiness_score, account_role, graduation_year
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
