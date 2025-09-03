const mongoose = require("mongoose");
const chapterSchema = require("./Chapter");

const courseSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    topic: { type: String, required: true },
    description: { type: String, default: "" },
    chapters: { type: [chapterSchema], default: [] },
    isPublic: { type: Boolean, default: false, index: true },
    shareId: { type: String, index: true },
    // Optional creation options/metadata
    difficulty: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advance"],
      default: "Beginner",
    },
    duration: { type: String, default: "1 Hour" },
    addVideo: { type: Boolean, default: false },
    desiredChapters: { type: Number, default: 5 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
