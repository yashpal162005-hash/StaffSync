import { Router } from "express";
import bcrypt from "bcryptjs";
import { User } from "../models.js";
import { protect, allow } from "../middleware.js";

const router = Router();
router.use(protect);
router.get("/", allow("hr", "manager"), async (req, res, next) => {
  try {
    const filter = req.user.role === "manager" ? { department: req.user.department } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).select("-password");
    res.json(users);
  } catch (e) { next(e); }
});
router.post("/", allow("hr"), async (req, res, next) => {
  try {
    const { name, email, password, role, department, jobTitle, phone } = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({ message: "Name, email and password (8+ characters) are required" });
    if (!["employee", "manager", "hr"].includes(role || "employee"))
      return res.status(400).json({ message: "Invalid role" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12),
      role: role || "employee", department, jobTitle, phone });
    res.status(201).json({ id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, jobTitle: user.jobTitle });
  } catch (e) { next(e); }
});
export default router;
