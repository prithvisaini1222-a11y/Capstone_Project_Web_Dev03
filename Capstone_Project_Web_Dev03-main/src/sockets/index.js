const jwt = require("jsonwebtoken");
const User = require("../models/User");

function registerSocketHandlers(io) {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication token required"));
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      const user = await User.findById(decoded.id).select("_id role name isActive");
      if (!user || !user.isActive) return next(new Error("Unauthorized socket connection"));
      socket.user = user;
      next();
    } catch { next(new Error("Invalid or expired socket token")); }
  });
  io.on("connection", socket => {
    socket.join(`user:${socket.user._id}`);
    socket.emit("connection:ready", { userId: socket.user._id, message: "Connected to CampusConnect" });
    socket.on("disconnect", () => {});
  });
}
module.exports = { registerSocketHandlers };
