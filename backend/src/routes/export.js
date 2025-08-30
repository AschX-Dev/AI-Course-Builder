const express = require("express");
const auth = require("../middleware/auth");
const Course = require("../models/Course");
const PDFDocument = require("pdfkit");

const router = express.Router();

// Export course as JSON attachment
router.post("/:id", auth, async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });
  if (!course) return res.status(404).json({ error: "not found" });

  const filename = `${
    course.title.replace(/[^a-z0-9-_]+/gi, "_") || "course"
  }.json`;
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(JSON.stringify(course.toJSON(), null, 2));
});

module.exports = router;

// Export course as PDF attachment
router.post("/:id/pdf", auth, async (req, res) => {
  const course = await Course.findOne({
    _id: req.params.id,
    ownerId: req.user.id,
  });
  if (!course) return res.status(404).json({ error: "not found" });

  const filename = `${
    course.title.replace(/[^a-z0-9-_]+/gi, "_") || "course"
  }.pdf`;
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  doc.fontSize(20).text(course.title, { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Topic: ${course.topic}`);
  if (course.description) {
    doc.moveDown(0.5);
    doc.fontSize(12).text(course.description);
  }
  doc.moveDown();

  (course.chapters || []).forEach((ch, idx) => {
    doc.fontSize(16).text(`${idx + 1}. ${ch.title}`);
    if (ch.content) {
      doc.moveDown(0.25);
      doc.fontSize(12).text(ch.content);
    }
    if (ch.explanation) {
      doc.moveDown(0.25);
      doc.fontSize(12).text(`Explanation: ${ch.explanation}`);
    }
    if (ch.codeExample) {
      doc.moveDown(0.25);
      doc.fontSize(12).text("Code Example:");
      doc.font("Courier").fontSize(10).text(ch.codeExample);
      doc.font("Helvetica");
    }
    if ((ch.references || []).length) {
      doc.moveDown(0.25);
      doc.fontSize(12).text("References:");
      (ch.references || []).forEach((r) => doc.fontSize(10).text(`- ${r}`));
    }
    doc.moveDown();
  });

  doc.end();
});
