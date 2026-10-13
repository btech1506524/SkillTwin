require("dotenv").config();

const express = require("express");
const cors = require("cors");
const db = require("./db");

const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/student");
const aiRoutes = require("./routes/ai");
const assessmentRoutes = require("./routes/assessments");
const roadmapRoutes = require("./routes/roadmap");

const app = express();
const PORT = Number(process.env.PORT || 5001);
const isProduction = process.env.NODE_ENV === "production";

function validateProductionConfig() {
  if (!isProduction) return;
  const secret = process.env.JWT_SECRET || "";
  if (secret.length < 32 || /replace|change|example|secret/i.test(secret)) {
    throw new Error("Production requires a randomly generated JWT_SECRET of at least 32 characters.");
  }
  if (!process.env.CLIENT_ORIGIN || process.env.CLIENT_ORIGIN.split(",").some(origin => origin.trim() === "*")) {
    throw new Error("Production requires an explicit CLIENT_ORIGIN allowlist; wildcard origins are not supported.");
  }
  if (process.env.CLIENT_ORIGIN.split(",").some(origin => {
    try { return new URL(origin.trim()).protocol !== "https:"; } catch { return true; }
  })) throw new Error("Production CLIENT_ORIGIN entries must use HTTPS.");
  if (process.env.DB_SSL !== "true") throw new Error("Production database connections must enable DB_SSL=true.");
  if (process.env.DB_SSL_REJECT_UNAUTHORIZED === "false") {
    throw new Error("Production database TLS must verify the server certificate; DB_SSL_REJECT_UNAUTHORIZED=false is not supported.");
  }
  for (const key of ["DB_HOST", "DB_USER", "DB_PASS", "DB_NAME"]) {
    if (!process.env[key]) throw new Error(`Production requires ${key} to be configured.`);
  }
}

validateProductionConfig();
app.disable("x-powered-by");
app.use((req, res, next) => {
  res.set({
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cache-Control": "no-store"
  });
  next();
});

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",").map(value => value.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    const error = new Error("Origin is not allowed by CORS.");
    error.status = 403;
    callback(error);
  }
}));
app.use(express.json({ limit: "64kb" }));

app.get("/", (req, res) => res.json({ service: "SkillTwin AI Backend API", status: "online" }));
app.get("/api/health/live", (req, res) => res.json({ status: "online" }));
app.get("/api/health/ready", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ status: "ready", database: "connected" });
  } catch (error) {
    console.error("Readiness check failed:", error.code || error.name);
    res.status(503).json({ status: "not_ready", database: "disconnected" });
  }
});
// Backwards-compatible health endpoint; detailed internals are intentionally omitted.
app.get("/api/health", async (req, res) => {
  try {
    await db.query("SELECT 1");
    res.json({ service: "SkillTwin AI Backend API", status: "online", database: "connected" });
  } catch (error) {
    console.error("Health check failed:", error.code || error.name);
    res.status(503).json({ service: "SkillTwin AI Backend API", status: "not_ready", database: "disconnected" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/assessments", assessmentRoutes);
app.use("/api/roadmap", roadmapRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: "API endpoint not found." }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Request body is too large." });
  }
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "Request body must contain valid JSON." });
  }
  if (error.status === 403 && error.message === "Origin is not allowed by CORS.") {
    return res.status(403).json({ success: false, message: "Origin is not allowed." });
  }
  console.error("Unhandled API error:", error.code || error.name || "Error");
  res.status(500).json({ success: false, message: "Internal server error." });
});

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`SkillTwin API listening on port ${PORT}`);
}).on("error", error => {
  console.error("Unable to bind API port:", error.code || error.name || "Error");
  process.exit(1);
});

let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received; shutting down gracefully.`);
  const forceExit = setTimeout(() => process.exit(1), 10000);
  forceExit.unref();
  server.close(async error => {
    try { await db.end(); } catch (dbError) { console.error("Database pool close failed:", dbError.code || dbError.name); }
    if (error) {
      console.error("HTTP server close failed:", error.code || error.name);
      process.exitCode = 1;
    }
    clearTimeout(forceExit);
  });
}
process.once("SIGTERM", () => shutdown("SIGTERM"));
process.once("SIGINT", () => shutdown("SIGINT"));
