import express from "express";
import cors from "cors";
import "dotenv/config";
import userRoutes from "./routes/userRoutes";
import requiterRoutes from "./routes/requiterRoutes";
import adminRoutes from "./routes/adminRoutes";
import paymentRoutes from "./routes/paymentRoutes";
import bookRoutes from "./routes/bookRoutes";
import chatRoutes from "./routes/chatRoutes";
import connectCloudinary from "./config/cloudinary";
import { Server } from "socket.io";

import http from "http";
import { socketHandler } from "./socket/socketHandler";

//initialize express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//cloudinary connect
(async () => {
  await connectCloudinary();
})();

// Middlewares
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get("/", (req, res) => {
  res.send("Server is running");
});

//routes
app.use("/api/user", userRoutes);
app.use("/api/requiter", requiterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/booking", bookRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 11000;

//Initialize the socket handler
socketHandler(io);

// IMPORTANT: Use server.listen instead of app.listen
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server running on port ${PORT}`);
});

// Error handling for server
server.on("error", (err) => {
  console.error("Server error:", err);
});
