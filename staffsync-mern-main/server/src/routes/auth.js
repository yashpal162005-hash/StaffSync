import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models.js";
import { protect } from "../middleware.js";

const router = Router();
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role,
  department: u.department, phone: u.phone, jobTitle: u.jobTitle });
const tokenFor = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password, department } = req.body;
    if (!name?.trim() || !email?.trim() || !password || password.length < 8)
      return res.status(400).json({ message: "Name, email and password (at least 8 characters) are required" });
    if (await User.exists({ email: email.toLowerCase().trim() }))
      return res.status(409).json({ message: "An account with this email already exists" });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), department: department || "General" });
    res.status(201).json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { next(e); }
});
router.post("/login", async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase().trim() }).select("+password");
    if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: tokenFor(user), user: publicUser(user) });
  } catch (e) { next(e); }
});
router.get("/me", protect, (req, res) => res.json({ user: publicUser(req.user) }));
router.patch("/profile", protect, async (req, res, next) => {
  try {
    const allowed = ["name", "phone", "department", "jobTitle"];
    allowed.forEach((key) => { if (typeof req.body[key] === "string") req.user[key] = req.body[key]; });
    await req.user.save();
    res.json({ user: publicUser(req.user) });
  } catch (e) { next(e); }
});
export default router;
