const mysql = require("mysql2/promise");

// ERR-001 FIX: Database credentials are now read from environment variables,
// not hardcoded in source code. Set these in backend/.env
const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS, // No default — must be set in .env
  database: process.env.DB_NAME || "skilltwin",
  port: parseInt(process.env.DB_PORT) || 3306,
});

module.exports = db;