const mysql = require("mysql2/promise");
const path = require("path");

const ssl = process.env.DB_SSL === "true"
  ? {
      rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
      ...(process.env.DB_SSL_CA ? {
        ca: require("fs").readFileSync(path.resolve(__dirname, process.env.DB_SSL_CA), "utf8")
      } : {})
    }
  : undefined;

const db = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || "skilltwin",
  port: Number(process.env.DB_PORT || 3306),

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 100,
  connectTimeout: 10000,
  ...(ssl ? { ssl } : {})
});

module.exports = db;
