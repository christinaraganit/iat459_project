const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  // 1. get token from header
  const token = req.header("Authorization");

  // 2. check if token exists
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    // 3. verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "fallbackSecret",
    );
    req.userId = decoded.id; // add user ID to request
    req.username = decoded.username; // add username to request
    req.role = decoded.role; // add role to request
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
}

function verifyAdmin(req, res, next) {
  if (!req.userId) {
    return res.status(401).json({ error: "Unauthorized: Please log in first" });
  }

  // Check if the user is an admin
  if (req.role !== "admin") {
    return res
      .status(403)
      .json({ error: "Forbidden: admin privileges required" });
  }

  next();
}

module.exports = { verifyToken, verifyAdmin };
