const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ===============================
// REGISTER
// ERR-003 FIX: Now accepts 'name' (frontend field) in addition to 'full_name' (legacy field)
// ERR-025 FIX: Returns JWT token and user object that match frontend expectations
// ERR-026 FIX: User object fields now match what AuthContext and Dashboard expect
// ===============================
router.post("/register", async (req, res) => {
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

    const studentName = name || full_name;

    if (!studentName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // Check if email already exists
    const [existingUser] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO users
      (full_name, email, password_hash, phone, college, branch, graduation_year)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        studentName,
        email,
        password_hash,
        phone || null,
        college || null,
        branch || null,
        graduation_year || null
      ]
    );

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return res.status(500).json({ success: false, message: "JWT configuration error" });
    }

    // ERR-025 FIX: Generate and return a JWT token (previously missing)
    const token = jwt.sign(
      { user_id: result.insertId, email },
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
        email,
        semester: semester || "5",
        branch: branch || "Computer Science & Engineering",
        targetRole: targetRole || "Software Developer",
        college: college || "",
        cgpa: "0.0",
        readinessScore: 68,
        skills: {},
        completedMilestones: []
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during registration"
    });
  }
});


// ===============================
// LOGIN
// ERR-026 FIX: Response user object now matches frontend field name expectations
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
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

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");
      return res.status(500).json({ success: false, message: "JWT configuration error" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

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
        readinessScore: user.readiness_score || 68,
        skills: {},
        completedMilestones: []
      }
    });

  } catch (error) {
    console.error("Login error:", error);
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
    console.error("Profile error:", error);
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