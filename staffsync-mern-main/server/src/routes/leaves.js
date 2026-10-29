import { Router } from "express";
import { Leave } from "../models.js";
import { protect, allow } from "../middleware.js";
const router = Router();
router.use(protect);
router.post("/", async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || !reason?.trim()) return res.status(400).json({ message: "Dates and reason are required" });
    if (endDate < startDate) return res.status(400).json({ message: "End date must be on or after start date" });
    const leave = await Leave.create({ user: req.user._id, leaveType, startDate, endDate, reason });
    res.status(201).json(await leave.populate("user", "name email department"));
  } catch (e) { next(e); }
});
router.get("/", async (req, res, next) => {
  try {
    const filter = req.user.role === "employee" ? { user: req.user._id } : {};
    const leaves = await Leave.find(filter).populate("user", "name email department").populate("reviewedBy", "name").sort({ createdAt: -1 });
    res.json(leaves);
  } catch (e) { next(e); }
});
router.patch("/:id/status", allow("manager", "hr"), async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected"].includes(status)) return res.status(400).json({ message: "Status must be approved or rejected" });
    const leave = await Leave.findById(req.params.id).populate("user", "name email department");
    if (!leave) return res.status(404).json({ message: "Leave request not found" });
    if (req.user.role === "manager" && leave.user.department !== req.user.department)
      return res.status(403).json({ message: "You can only review leaves for your department" });
    if (leave.status !== "pending") return res.status(409).json({ message: "This request has already been reviewed" });
    leave.status = status; leave.reviewedBy = req.user._id; leave.reviewedAt = new Date();
    await leave.save(); res.json(leave);
  } catch (e) { next(e); }
});
export default router;
