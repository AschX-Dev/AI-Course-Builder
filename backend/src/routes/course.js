const express = require("express");
const Course = require("../models/Course");
const auth = require("../middleware/auth");
const {
  generateCourseOutline,
  generateChapterContent,
} = require("../services/ai");

const router = express.Router();
const rateLimit = require("express-rate-limit");

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});
const path = require("path");

// Generate outline
router.post("/generate", auth, aiLimiter, async (req, res) => {
  const { title, topic, options } = req.body || {};
  if (!title || !topic)
    return res.status(400).json({ error: "title and topic required" });

  const outline = await generateCourseOutline(title, topic, options);
  const course = await Course.create({
    ownerId: req.user.id,
    title: outline.title,
    topic,
    description: outline.description,
    chapters: outline.chapters.map((c) => ({ title: c.title })),
    difficulty: options?.difficulty || "Beginner",
    duration: options?.duration || "1 Hour",
    addVideo: !!options?.addVideo,
    desiredChapters: Number(
      options?.desiredChapters || outline.chapters?.length || 5
    ),
  });
  res.json(course);
});

// List user's courses
router.get("/", auth, async (req, res) => {
  const courses = await Course.find({ ownerId: req.user.id }).sort({
    createdAt: -1,
  });
  res.json(courses);
});

// Fetch course
router.get("/:id", auth, async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });
  if (!course) return res.status(404).json({ error: "not found" });
  res.json(course);
});

// Update course
router.put("/:id", auth, async (req, res) => {
  const update = req.body || {};
  const course = await Course.findOneAndUpdate(
    { _id: req.params.id, ownerId: req.user.id },
    update,
    { new: true }
  );
  if (!course) return res.status(404).json({ error: "not found" });
  res.json(course);
});

// Publish course (create share link)
router.post("/:id/publish", auth, async (req, res) => {
  const id = req.params.id;
  const shareId = Math.random().toString(36).slice(2, 10);
  const course = await Course.findOneAndUpdate(
    { _id: id, ownerId: req.user.id },
    { isPublic: true, shareId },
    { new: true }
  );
  if (!course) return res.status(404).json({ error: "not found" });
  res.json({ ok: true, shareId: course.shareId });
});

// Unpublish course
router.post("/:id/unpublish", auth, async (req, res) => {
  const id = req.params.id;
  const course = await Course.findOneAndUpdate(
    { _id: id, ownerId: req.user.id },
    { isPublic: false, shareId: null },
    { new: true }
  );
  if (!course) return res.status(404).json({ error: "not found" });
  res.json({ ok: true });
});

// Delete course
router.delete("/:id", auth, async (req, res) => {
  const query = {
    _id: req.params.id,
    ownerId: req.user.id,
  };
  try {
    const deleted = await Course.findOneAndDelete(query);
    if (!deleted) {
      console.log("DELETE /course not found", { query });
      return res.status(404).json({ error: "not found" });
    }
    console.log("DELETE /course ok", {
      id: deleted._id.toString(),
      ownerId: deleted.ownerId.toString(),
    });
    return res.json({ ok: true });
  } catch (e) {
    console.error("DELETE /course error", { query, error: e.message });
    return res.status(500).json({ error: "server error" });
  }
});

// Generate chapter content
router.post(
  "/:id/chapter/:chapterId/generate",
  auth,
  aiLimiter,
  async (req, res) => {
    const { id, chapterId } = req.params;
    const course = await Course.findOne({ _id: id, ownerId: req.user.id });
    if (!course) return res.status(404).json({ error: "course not found" });

    const chapter = course.chapters.id(chapterId);
    if (!chapter) return res.status(404).json({ error: "chapter not found" });

    const generated = await generateChapterContent(chapter.title, course.topic);
    chapter.content = generated.content;
    chapter.explanation = generated.explanation;
    chapter.codeExample = generated.codeExample;
    chapter.references = generated.references;

    await course.save();
    res.json(chapter);
  }
);

module.exports = router;
