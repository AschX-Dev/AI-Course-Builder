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
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);

