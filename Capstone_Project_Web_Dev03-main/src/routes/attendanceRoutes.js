const router = require("express").Router();
const c = require("../controllers/attendanceController");
const { protect, authorize } = require("../middleware/authMiddleware");
router.use(protect);
router.post("/mark", authorize("admin", "faculty"), c.markAttendance);
router.get("/mine", c.myAttendance);
router.get("/summary", c.attendanceSummary);
router.get("/low", authorize("admin", "faculty"), c.lowAttendance);
module.exports = router;
