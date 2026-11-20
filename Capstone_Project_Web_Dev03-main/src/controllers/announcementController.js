const Announcement = require("../models/Announcement");
const asyncHandler = require("../utils/asyncHandler");
const { eventBus } = require("../events/eventBus");
exports.createAnnouncement = asyncHandler(async (req, res) => {
  const { title, message, audience = "university", course, section } = req.body;
  if (!title || !message) return res.status(400).json({ success: false, message: "title and message are required" });
  if (!["university", "course", "section"].includes(audience)) return res.status(400).json({ success: false, message: "Invalid audience" });
  if (audience === "course" && !course) return res.status(400).json({ success: false, message: "course is required for course announcements" });
  if (audience === "section" && !section) return res.status(400).json({ success: false, message: "section is required for section announcements" });
  const announcement = await Announcement.create({ title, message, audience, course, section, createdBy: req.user._id });
  eventBus.emit("announcement.created", { announcement });
  res.status(201).json({ success: true, data: announcement });
});
exports.listAnnouncements = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.course) filter.$or = [{ audience: "university" }, { audience: "course", course: req.query.course }];
  const data = await Announcement.find(filter).populate("createdBy", "name role").sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data });
});
