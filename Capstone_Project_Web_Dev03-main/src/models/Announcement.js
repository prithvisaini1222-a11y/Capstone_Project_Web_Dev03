const mongoose = require("mongoose");
const schema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  message: { type: String, required: true, maxlength: 2000 },
  audience: { type: String, enum: ["university", "course", "section"], default: "university" },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });
schema.index({ audience: 1, createdAt: -1 });
module.exports = mongoose.model("Announcement", schema);
