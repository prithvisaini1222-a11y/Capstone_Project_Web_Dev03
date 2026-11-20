const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
  faculty: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ["present", "absent", "late"], required: true },
  markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  correctionNote: { type: String, default: "" }
}, { timestamps: true });
schema.index({ student: 1, course: 1, date: 1 }, { unique: true });
schema.index({ course: 1, date: -1 });
module.exports = mongoose.model("Attendance", schema);
