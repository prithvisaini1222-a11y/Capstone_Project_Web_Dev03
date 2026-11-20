const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8, select: false },
  role: { type: String, enum: ["admin", "faculty", "student"], default: "student", index: true },
  studentId: { type: String, sparse: true, unique: true },
  department: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  refreshTokenHash: { type: String, select: false },
  tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12); next();
});
userSchema.methods.comparePassword = function(password) { return bcrypt.compare(password, this.password); };
module.exports = mongoose.model("User", userSchema);
