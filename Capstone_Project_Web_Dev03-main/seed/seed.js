require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Course = require("../src/models/Course");
const Section = require("../src/models/Section");
const Enrollment = require("../src/models/Enrollment");

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Section.deleteMany({}), Enrollment.deleteMany({})]);
  const [admin, faculty, student1, student2] = await User.create([
    { name: "Campus Admin", email: "admin@campus.test", password: "Admin@12345", role: "admin", department: "Administration" },
    { name: "Demo Faculty", email: "faculty@campus.test", password: "Faculty@12345", role: "faculty", department: "CSE" },
    { name: "Demo Student One", email: "student1@campus.test", password: "Student@12345", role: "student", studentId: "STU001", department: "CSE" },
    { name: "Demo Student Two", email: "student2@campus.test", password: "Student@12345", role: "student", studentId: "STU002", department: "CSE" }
  ]);
  const course = await Course.create({ code: "CSE201", title: "Backend Development", department: "CSE", credits: 4, faculty: faculty._id });
  const section = await Section.create({ name: "F", course: course._id, faculty: faculty._id, semester: "4", academicYear: "2026-27" });
  await Enrollment.create([
    { student: student1._id, course: course._id, section: section._id },
    { student: student2._id, course: course._id, section: section._id }
  ]);
  console.log("Seed complete. Demo logins:");
  console.log("Admin: admin@campus.test / Admin@12345");
  console.log("Faculty: faculty@campus.test / Faculty@12345");
  console.log("Student: student1@campus.test / Student@12345");
  await mongoose.disconnect();
}
seed().catch(e => { console.error(e); process.exit(1); });
