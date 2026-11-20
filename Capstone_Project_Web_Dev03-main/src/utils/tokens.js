const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.createAccessToken = user => jwt.sign(
  { id: user._id.toString(), role: user.role },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: process.env.ACCESS_TOKEN_EXPIRES || "15m" }
);
exports.createRefreshToken = user => jwt.sign(
  { id: user._id.toString(), tokenVersion: user.tokenVersion || 0 },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: process.env.REFRESH_TOKEN_EXPIRES || "7d" }
);
exports.hashToken = token => crypto.createHash("sha256").update(token).digest("hex");
