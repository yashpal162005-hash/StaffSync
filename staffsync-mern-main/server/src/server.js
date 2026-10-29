import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import employeeRoutes from "./routes/employees.js";
import attendanceRoutes from "./routes/attendance.js";
import leaveRoutes from "./routes/leaves.js";
import announcementRoutes from "./routes/announcements.js";
import trainingRoutes from "./routes/trainings.js";
import { seedDatabase } from "./seed.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, "../../client/dist");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok", app: "StaffSync API" }));
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/trainings", trainingRoutes);

// Serve static frontend in production
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err?.message || err);
});
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err?.message || err);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB Connection Error:", err?.message || err);
});
mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Reconnecting...");
});

const port = process.env.PORT || 5000;

async function startServer() {
  const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/staffsync";
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("Connected to MongoDB successfully.");
    await seedDatabase();
  } catch (err) {
    console.error("Primary MongoDB connection failed:", err.message);
    if (uri !== "mongodb://127.0.0.1:27017/staffsync") {
      console.log("Falling back to local MongoDB (127.0.0.1:27017)...");
      try {
        await mongoose.connect("mongodb://127.0.0.1:27017/staffsync");
        console.log("Connected to local MongoDB successfully.");
        await seedDatabase();
      } catch (localErr) {
        console.error("Local MongoDB fallback failed:", localErr.message);
      }
    }
  }

  app.listen(port, () => console.log(`StaffSync API running on ${port}`));
}

startServer();



