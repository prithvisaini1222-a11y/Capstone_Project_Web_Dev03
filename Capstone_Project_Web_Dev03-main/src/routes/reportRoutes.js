const router = require("express").Router();
const c = require("../controllers/reportController");
const { protect, authorize } = require("../middleware/authMiddleware");
router.use(protect, authorize("admin"));
router.get("/enrollments", c.enrollmentReport);
module.exports = router;
