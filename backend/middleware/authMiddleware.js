const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided."
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token || authHeader.split(" ").length !== 2) {
      return res.status(401).json({ success: false, message: "Invalid authorization header." });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured."
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (!decoded || typeof decoded !== "object" || !Number.isSafeInteger(Number(decoded.user_id)) || Number(decoded.user_id) < 1) {
      return res.status(401).json({ success: false, message: "Invalid or expired token." });
    }

    req.user = { ...decoded, user_id: Number(decoded.user_id) };

    next();

  } catch (error) {
    console.error("Authentication error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token."
    });
  }
};

module.exports = authMiddleware;
