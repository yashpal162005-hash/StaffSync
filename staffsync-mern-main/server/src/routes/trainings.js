import { Router } from "express";
import { Training } from "../models.js";
import { protect, allow } from "../middleware.js";
const router = Router();
router.use(protect);
router.get("/", async (_req, res, next) => {
  try { res.json(await Training.find().populate("createdBy", "name").sort({ date: 1 }).limit(100)); }
  catch (e) { next(e); }
});
router.post("/", allow("manager", "hr"), async (req, res, next) => {
  try {
    const { title, description, date, duration } = req.body;
    if (!title?.trim() || !description?.trim() || !date) return res.status(400).json({ message: "Title, description and date are required" });
    const item = await Training.create({ title, description, date, duration, createdBy: req.user._id });
    res.status(201).json(await item.populate("createdBy", "name"));
  } catch (e) { next(e); }
});
export default router;
