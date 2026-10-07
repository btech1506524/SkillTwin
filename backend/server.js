const db = require("./db");
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({
    message: "SkillTwin AI Backend is running!"
  });
});

// Database test route
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT 1 AS test");

    res.json({
      success: true,
      message: "Database connection successful",
      data: rows
    });
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
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});