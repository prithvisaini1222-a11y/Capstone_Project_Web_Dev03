const Enrollment = require("../models/Enrollment");
const asyncHandler = require("../utils/asyncHandler");
exports.enrollmentReport = asyncHandler(async (req, res) => {
  const data = await Enrollment.aggregate([
    { $group: { _id: "$course", enrollmentCount: { $sum: 1 } } },
    { $lookup: { from: "courses", localField: "_id", foreignField: "_id", as: "course" } },
    { $unwind: "$course" },
    { $project: { _id: 0, courseCode: "$course.code", courseTitle: "$course.title", enrollmentCount: 1 } },
    { $sort: { enrollmentCount: -1 } }
  ]);
  res.json({ success: true, data });
});
