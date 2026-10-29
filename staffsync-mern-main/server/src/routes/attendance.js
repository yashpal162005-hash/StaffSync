import { Router } from "express";
import { Attendance } from "../models.js";
import { protect, allow } from "../middleware.js";
const router = Router();
router.use(protect);
router.post("/check-in", async (req, res, next) => {
  try {
    const date = new Date().toISOString().slice(0, 10);
    let record = await Attendance.findOne({ user: req.user._id, date });
    if (record?.checkIn) return res.status(409).json({ message: "You have already checked in today" });
    if (!record) record = new Attendance({ user: req.user._id, date });
    record.checkIn = new Date(); record.status = "present";
    await record.save(); res.status(201).json(record);
  } catch (e) { next(e); }
});
router.post("/check-out", async (req, res, next) => {
  try {
    const date = new Date().toISOString().slice(0, 10);
    const record = await Attendance.findOne({ user: req.user._id, date });
    if (!record?.checkIn) return res.status(400).json({ message: "Check in before checking out" });
    if (record.checkOut) return res.status(409).json({ message: "You have already checked out today" });
    record.checkOut = new Date(); record.status = "completed"; await record.save(); res.json(record);
  } catch (e) { next(e); }
});
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === "employee") filter.user = req.user._id;
    else if (req.query.userId) filter.user = req.query.userId;
    const rows = await Attendance.find(filter).populate("user", "name email department").sort({ date: -1 }).limit(200);
    res.json(rows);
  } catch (e) { next(e); }
});
export default router;
