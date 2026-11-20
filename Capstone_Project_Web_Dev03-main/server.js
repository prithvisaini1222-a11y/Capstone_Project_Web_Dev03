require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const { Server } = require("socket.io");
const { registerSocketHandlers } = require("./src/sockets");
const { eventBus } = require("./src/events/eventBus");

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();
  const server = http.createServer(app);
  const io = new Server(server, {
    cors: { origin: process.env.CLIENT_ORIGIN || "*", methods: ["GET", "POST"] }
  });
  app.set("io", io);
  registerSocketHandlers(io);
  eventBus.on("announcement.created", ({ announcement }) => {
    io.emit("announcement:new", {
      id: announcement._id,
      title: announcement.title,
      message: announcement.message,
      audience: announcement.audience
    });
  });
  server.listen(PORT, () => console.log(`CampusConnect API running on port ${PORT}`));
}
start().catch(err => { console.error("Startup failed:", err); process.exit(1); });
