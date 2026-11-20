const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1), limit = Math.min(100, Number(req.query.limit) || 10);
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.search) filter.name = { $regex: req.query.search, $options: "i" };
  const [users, total] = await Promise.all([
    User.find(filter).select("-password -refreshTokenHash").skip((page - 1) * limit).limit(limit).sort({ createdAt: -1 }),
    User.countDocuments(filter)
  ]);
  res.json({ success: true, data: users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, studentId, department } = req.body;
  if (!["admin", "faculty", "student"].includes(role)) return res.status(400).json({ success: false, message: "Valid role is required" });
  const user = await User.create({ name, email, password, role, studentId, department });
  res.status(201).json({ success: true, data: { id: user._id, name, email, role } });
});
exports.updateUser = asyncHandler(async (req, res) => {
  const allowed = ["name", "department", "isActive"];
  const updates = {};
  allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }).select("-password -refreshTokenHash");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
});
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "User deleted" });
});
