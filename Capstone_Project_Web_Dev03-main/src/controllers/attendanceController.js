const Attendance = require("../models/Attendance");
const Enrollment = require("../models/Enrollment");
const Section = require("../models/Section");
const asyncHandler = require("../utils/asyncHandler");
const { eventBus } = require("../events/eventBus");

exports.markAttendance = asyncHandler(async (req, res) => {
  const { course, section, date, records } = req.body;
  if (!course || !section || !date || !Array.isArray(records) || !records.length) return res.status(400).json({ success: false, message: "course, section, date and non-empty records are required" });
  const sectionDoc = await Section.findById(section);
  if (!sectionDoc || !sectionDoc.course.equals(course)) return res.status(400).json({ success: false, message: "Invalid course/section combination" });
  if (req.user.role === "faculty" && !sectionDoc.faculty.equals(req.user._id)) return res.status(403).json({ success: false, message: "You are not assigned to this section" });
  const sessionDate = new Date(date);
  if (Number.isNaN(sessionDate.getTime())) return res.status(400).json({ success: false, message: "Invalid date" });
  sessionDate.setHours(0, 0, 0, 0);
  const output = [];
  for (const record of records) {
    if (!["present", "absent", "late"].includes(record.status)) return res.status(400).json({ success: false, message: "Each status must be present, absent or late" });
    const enrolled = await Enrollment.findOne({ student: record.student, course, section });
    if (!enrolled) return res.status(400).json({ success: false, message: `Student ${record.student} is not enrolled in this section` });
    const attendance = await Attendance.findOneAndUpdate(
      { student: record.student, course, date: sessionDate },
      { $set: { section, faculty: sectionDoc.faculty, status: record.status, markedBy: req.user._id } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    output.push(attendance);
  }
  res.status(201).json({ success: true, message: "Attendance saved", data: output });
});

exports.myAttendance = asyncHandler(async (req, res) => {
  const studentId = req.user.role === "student" ? req.user._id : req.query.student;
  if (!studentId) return res.status(400).json({ success: false, message: "student query parameter is required" });
  if (req.user.role === "faculty") {
    const assigned = await Section.find({ faculty: req.user._id }).distinct("_id");
    const records = await Attendance.find({ student: studentId, section: { $in: assigned } }).populate("course", "code title").sort({ date: -1 });
    return res.json({ success: true, data: records });
  }
  const data = await Attendance.find({ student: studentId }).populate("course", "code title").sort({ date: -1 });
  res.json({ success: true, data });
});

exports.attendanceSummary = asyncHandler(async (req, res) => {
  const studentId = req.user.role === "student" ? req.user._id : req.query.student;
  if (!studentId) return res.status(400).json({ success: false, message: "student query parameter is required" });
  const summary = await Attendance.aggregate([
    { $match: { student: studentId } },
    { $group: { _id: "$course", totalClasses: { $sum: 1 }, attended: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } } } },
    { $addFields: { percentage: { $round: [{ $multiply: [{ $divide: ["$attended", "$totalClasses"] }, 100] }, 2] } } },
    { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $project: { courseId: "$_id", _id: 0, code: "$course.code", title: "$course.title", totalClasses: 1, attended: 1, percentage: 1 } }
  ]);
  res.json({ success: true, data: summary, threshold: Number(process.env.ATTENDANCE_THRESHOLD || 75) });
});

exports.lowAttendance = asyncHandler(async (req, res) => {
  const threshold = Math.min(100, Math.max(0, Number(req.query.threshold) || Number(process.env.ATTENDANCE_THRESHOLD) || 75));
  const data = await Attendance.aggregate([
    { $group: { _id: { student: "$student", course: "$course" }, total: { $sum: 1 }, attended: { $sum: { $cond: [{ $in: ["$status", ["present", "late"]] }, 1, 0] } } } },
    { $addFields: { percentage: { $multiply: [{ $divide: ["$attended", "$total"] }, 100] } } },
    { $match: { percentage: { $lt: threshold } } },
    { $lookup: { from: "users", localField: "_id.student", foreignField: "_id", as: "student" } },
    { $lookup: { from: "courses", localField: "_id.course", foreignField: "_id", as: "course" } },
    { $unwind: "$student" }, { $unwind: "$course" },
    { $project: { _id: 0, studentName: "$student.name", studentEmail: "$student.email", courseCode: "$course.code", courseTitle: "$course.title", total: 1, attended: 1, percentage: { $round: ["$percentage", 2] } } }
  ]);
  res.json({ success: true, threshold, data });
});
