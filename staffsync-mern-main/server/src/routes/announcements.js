import { Router } from "express";
import { Announcement } from "../models.js";
import { protect, allow } from "../middleware.js";
const router = Router();
router.use(protect);
router.get("/", async (_req, res, next) => {
  try { res.json(await Announcement.find().populate("author", "name").sort({ createdAt: -1 }).limit(100)); }
  catch (e) { next(e); }
});
router.post("/", allow("hr"), async (req, res, next) => {
  try {
    if (!req.body.title?.trim() || !req.body.body?.trim()) return res.status(400).json({ message: "Title and announcement body are required" });
    const item = await Announcement.create({ title: req.body.title, body: req.body.body, author: req.user._id });
    res.status(201).json(await item.populate("author", "name"));
  } catch (e) { next(e); }
});
export default router;
