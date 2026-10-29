import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["employee", "manager", "hr"], default: "employee" },
  department: { type: String, default: "General" },
  phone: { type: String, default: "" },
  jobTitle: { type: String, default: "Employee" }
}, { timestamps: true });

const attendanceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  date: { type: String, required: true },
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ["present", "completed"], default: "present" }
}, { timestamps: true });
attendanceSchema.index({ user: 1, date: 1 }, { unique: true });

const leaveSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  leaveType: { type: String, enum: ["Casual", "Sick", "Annual", "Other"], default: "Casual" },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  reason: { type: String, required: true, maxlength: 1000 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  reviewedAt: Date
}, { timestamps: true });

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

const trainingSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  date: { type: String, required: true },
  duration: { type: String, default: "1 hour" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

export const User = mongoose.model("User", userSchema);
export const Attendance = mongoose.model("Attendance", attendanceSchema);
export const Leave = mongoose.model("Leave", leaveSchema);
export const Announcement = mongoose.model("Announcement", announcementSchema);
export const Training = mongoose.model("Training", trainingSchema);
