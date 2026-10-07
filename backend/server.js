// ERR-030 FIX: dotenv.config() MUST be the very first statement.
// Previously it was called on line 4 AFTER db.js was required on line 1,
// meaning DB credentials from .env were not yet loaded when the pool was created.
require("dotenv").config();

const db = require("./db");
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");

const app = express();

// ERR-024 FIX: Restrict CORS to configured frontend origin instead of allowing all
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use("/api/auth", authRoutes);

// Health check route
app.get("/", (req, res) => {
  res.json({
    message: "SkillTwin AI Backend (MySQL) is running!",
    note: "This is the MySQL backend on port 5001. The primary API server runs on port 5000."
  });
});

// Database test route
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");
    res.json({ success: true, message: "Database connection successful", data: rows });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

// Start server
// ERR-002 FIX: Changed default port from 5000 to 5001 to avoid conflict with server/ (primary backend)
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`MySQL Backend running on http://localhost:${PORT}`);
});