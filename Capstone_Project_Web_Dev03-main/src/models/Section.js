const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  semester: { type: String, required: true },
  academicYear: { type: String, required: true }
}, { timestamps: true });
schema.index({ course: 1, name: 1, academicYear: 1 }, { unique: true });
module.exports = mongoose.model("Section", schema);
