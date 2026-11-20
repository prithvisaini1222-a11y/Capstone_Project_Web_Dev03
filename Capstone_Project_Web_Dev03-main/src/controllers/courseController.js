const Course = require("../models/Course");
const Section = require("../models/Section");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
exports.createCourse = asyncHandler(async (req, res) => {
  const faculty = await User.findById(req.body.faculty);
  if (!faculty || faculty.role !== "faculty") return res.status(400).json({ success: false, message: "A valid faculty user is required" });
  const course = await Course.create(req.body);
  res.status(201).json({ success: true, data: course });
});
exports.listCourses = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.user.role === "faculty") filter.faculty = req.user._id;
  if (req.query.search) filter.title = { $regex: req.query.search, $options: "i" };
  const courses = await Course.find(filter).populate("faculty", "name email").sort({ title: 1 });
  res.json({ success: true, data: courses });
});
exports.getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate("faculty", "name email");
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  res.json({ success: true, data: course });
});
exports.updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  if (req.user.role === "faculty" && !course.faculty.equals(req.user._id)) return res.status(403).json({ success: false, message: "You can update only your assigned courses" });
  const fields = ["title", "description", "department", "credits", "faculty"];
  fields.forEach(k => { if (req.body[k] !== undefined) course[k] = req.body[k]; });
  await course.save();
  res.json({ success: true, data: course });
});
exports.deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndDelete(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  await Section.deleteMany({ course: course._id });
  await Enrollment.deleteMany({ course: course._id });
  res.json({ success: true, message: "Course and related sections/enrollments deleted" });
});
exports.createSection = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.body.course);
  if (!course) return res.status(404).json({ success: false, message: "Course not found" });
  const facultyId = req.body.faculty || course.faculty;
  if (req.user.role === "faculty" && !course.faculty.equals(req.user._id)) return res.status(403).json({ success: false, message: "Not assigned to this course" });
  const section = await Section.create({ ...req.body, faculty: facultyId });
  res.status(201).json({ success: true, data: section });
});
exports.listSections = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  if (req.user.role === "faculty") filter.faculty = req.user._id;
  const data = await Section.find(filter).populate("course", "code title").populate("faculty", "name");
  res.json({ success: true, data });
});
exports.enrollStudent = asyncHandler(async (req, res) => {
  const { student, course, section } = req.body;
  const [studentDoc, courseDoc, sectionDoc] = await Promise.all([User.findById(student), Course.findById(course), Section.findById(section)]);
  if (!studentDoc || studentDoc.role !== "student") return res.status(400).json({ success: false, message: "Valid student is required" });
  if (!courseDoc || !sectionDoc || !sectionDoc.course.equals(courseDoc._id)) return res.status(400).json({ success: false, message: "Course and section do not match" });
  const enrollment = await Enrollment.create({ student, course, section });
  res.status(201).json({ success: true, data: enrollment });
});
exports.myEnrollments = asyncHandler(async (req, res) => {
  const filter = req.user.role === "student" ? { student: req.user._id } : {};
  if (req.query.student && req.user.role !== "student") filter.student = req.query.student;
  const data = await Enrollment.find(filter).populate("student", "name studentId").populate("course", "code title").populate("section", "name semester");
  res.json({ success: true, data });
});
