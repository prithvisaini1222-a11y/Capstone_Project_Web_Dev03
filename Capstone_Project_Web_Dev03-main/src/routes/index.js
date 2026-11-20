const router = require("express").Router();
router.use("/auth", require("./authRoutes"));
router.use("/users", require("./userRoutes"));
router.use("/courses", require("./courseRoutes"));
router.use("/attendance", require("./attendanceRoutes"));
router.use("/announcements", require("./announcementRoutes"));
router.use("/reports", require("./reportRoutes"));
module.exports = router;
