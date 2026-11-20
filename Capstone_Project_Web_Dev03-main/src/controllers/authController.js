const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const { createAccessToken, createRefreshToken, hashToken } = require("../utils/tokens");
const jwt = require("jsonwebtoken");

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, studentId, department } = req.body;
  if (!name || !email || !password) return res.status(400).json({ success: false, message: "name, email and password are required" });
  if (password.length < 8) return res.status(400).json({ success: false, message: "Password must contain at least 8 characters" });
  if (await User.findOne({ email })) return res.status(409).json({ success: false, message: "Email already registered" });
  // Public registration is student-only. Admin creates faculty/admin accounts.
  const user = await User.create({ name, email, password, studentId, department, role: "student" });
  res.status(201).json({ success: true, message: "Student account created", data: { id: user._id, name: user.name, email: user.email, role: user.role } });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +refreshTokenHash");
  if (!user || !user.isActive || !(await user.comparePassword(password || ""))) return res.status(401).json({ success: false, message: "Invalid email or password" });
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  res.json({ success: true, data: { accessToken, refreshToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } } });
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ success: false, message: "refreshToken is required" });
  let decoded;
  try { decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET); }
  catch { return res.status(401).json({ success: false, message: "Invalid or expired refresh token" }); }
  const user = await User.findById(decoded.id).select("+refreshTokenHash");
  if (!user || user.tokenVersion !== decoded.tokenVersion || user.refreshTokenHash !== hashToken(refreshToken)) return res.status(401).json({ success: false, message: "Refresh token revoked" });
  const accessToken = createAccessToken(user);
  const newRefreshToken = createRefreshToken(user);
  user.refreshTokenHash = hashToken(newRefreshToken);
  await user.save();
  res.json({ success: true, data: { accessToken, refreshToken: newRefreshToken } });
});

exports.logout = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+refreshTokenHash");
  user.refreshTokenHash = undefined;
  user.tokenVersion += 1;
  await user.save();
  res.json({ success: true, message: "Logged out; refresh token invalidated" });
});

exports.me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});
