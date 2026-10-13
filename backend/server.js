require("dotenv").config();

const express = require("express");
const cors = require("cors");

const db = require("./db");

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const aiRoutes = require("./routes/ai");

const app = express();

const PORT =
  process.env.PORT || 5000;


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",").map(value => value.trim())
  })
);

app.use(express.json());


// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {

  res.json({
    service: "SkillTwin AI Backend API",
    status: "online"
  });

});


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", async (req, res) => {

  try {

    await db.query("SELECT 1");

    res.json({
      service: "SkillTwin AI Backend API",
      status: "online",
      database: "connected",

      endpoints: {
        auth: [
          "/api/auth/login",
          "/api/auth/register",
          "/api/auth/profile"
        ],

        student: [
          "/api/student/profile",
          "/api/student/skills",
          "/api/student/target-role",
          "/api/student/gaps",
          "/api/student/readiness",
          "/api/student/milestones"
        ],

        ai: [
          "/api/ai/simulate",
          "/api/ai/analyze-resume"
        ]
      }
    });

  } catch (error) {

    res.status(500).json({
      service: "SkillTwin AI Backend API",
      status: "online",
      database: "disconnected",
      error: error.message
    });

  }

});


// =====================================================
// ROUTES
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/student",
  studentRoutes
);

app.use(
  "/api/ai",
  aiRoutes
);


// =====================================================
// 404
// =====================================================

app.use((req, res) => {

  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
    path: req.originalUrl
  });

});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((error, req, res, next) => {

  console.error(error);

  res.status(500).json({
    success: false,
    message: "Internal server error."
  });

});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {

  console.log("");
  console.log("======================================");
  console.log("      SKILLTWIN AI BACKEND");
  console.log("======================================");
  console.log(
    `Server running: http://localhost:${PORT}`
  );
  console.log(
    `Health check: http://localhost:${PORT}/api/health`
  );
  console.log("");
  console.log("Authentication:");
  console.log("POST /api/auth/register");
  console.log("POST /api/auth/login");
  console.log("GET  /api/auth/profile");
  console.log("");
  console.log("Student:");
  console.log("GET /api/student/profile");
  console.log("GET /api/student/skills");
  console.log("PUT /api/student/skills");
  console.log("GET /api/student/target-role");
  console.log("PUT /api/student/target-role");
  console.log("GET /api/student/readiness");
  console.log("GET /api/student/gaps");
  console.log("");
  console.log("AI:");
  console.log("POST /api/ai/simulate");
  console.log("POST /api/ai/analyze-resume");
  console.log("======================================");
  console.log("");

});
