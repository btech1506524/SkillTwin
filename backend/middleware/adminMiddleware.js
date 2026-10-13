const db = require("../db");

async function adminMiddleware(req, res, next) {
  try {
    const [rows] = await db.query(
      "SELECT account_role FROM users WHERE user_id = ? LIMIT 1",
      [req.user.user_id]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, message: "Account no longer exists." });
    }
    if (rows[0].account_role !== "admin") {
      return res.status(403).json({ success: false, message: "Administrator access is required." });
    }
    req.user.account_role = rows[0].account_role;
    next();
  } catch (error) {
    console.error("Admin authorization check failed:", error.code || error.name || "Error");
    res.status(503).json({ success: false, message: "Admin access is unavailable. Confirm database migrations are applied." });
  }
}

module.exports = adminMiddleware;
