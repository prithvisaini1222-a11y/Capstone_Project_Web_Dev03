const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Authentication required" });
  let decoded;
  try { decoded = jwt.verify(header.split(" ")[1], process.env.JWT_ACCESS_SECRET); }
  catch { return res.status(401).json({ success: false, message: "Invalid or expired access token" }); }
  const user = await User.findById(decoded.id).select("-password -refreshTokenHash");
  if (!user || !user.isActive) return res.status(401).json({ success: false, message: "Account unavailable" });
  req.user = user;
  next();
});

exports.authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ success: false, message: "You do not have permission for this action" });
  next();
};
