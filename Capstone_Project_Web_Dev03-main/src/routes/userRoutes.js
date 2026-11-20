const router = require("express").Router();
const c = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
router.use(protect);
router.get("/", authorize("admin"), c.listUsers);
router.post("/", authorize("admin"), c.createUser);
router.patch("/:id", authorize("admin"), c.updateUser);
router.delete("/:id", authorize("admin"), c.deleteUser);
module.exports = router;
