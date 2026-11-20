const router = require("express").Router();
const c = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");
router.use(protect);
router.get("/", c.listAnnouncements);
router.post("/", authorize("admin", "faculty"), c.createAnnouncement);
module.exports = router;
