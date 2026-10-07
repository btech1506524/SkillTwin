const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


// ===============================
// REGISTER
// ===============================
router.post("/register", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      phone,
      college,
      branch,
      graduation_year
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required"
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

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query(
      `INSERT INTO users
      (full_name, email, password_hash, phone, college, branch, graduation_year)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        full_name,
        email,
        password_hash,
        phone || null,
        college || null,
        branch || null,
        graduation_year || null
      ]
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      user_id: result.insertId
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
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
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

    // Compare password with bcrypt hash
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in .env");

      return res.status(500).json({
        success: false,
        message: "JWT configuration error"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        user_id: user.user_id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    // Send response
    res.json({
      success: true,
      message: "Login successful",
      token: token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        college: user.college,
        branch: user.branch,
        graduation_year: user.graduation_year
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
module.exports = router ;