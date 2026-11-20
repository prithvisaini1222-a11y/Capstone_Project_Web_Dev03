const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "" },
  department: { type: String, required: true },
  credits: { type: Number, min: 1, max: 6, default: 3 },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
schema.index({ department: 1, title: 1 });
module.exports = mongoose.model("Course", schema);
