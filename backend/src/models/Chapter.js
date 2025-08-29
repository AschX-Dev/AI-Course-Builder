const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, default: "" },
    explanation: { type: String, default: "" },
    codeExample: { type: String, default: "" },
    references: { type: [String], default: [] },
  },
  { _id: true, timestamps: true }
);

module.exports = chapterSchema; // export as subdocument schema

