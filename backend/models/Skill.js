const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "Programming",
        "Design",
        "Academics",
        "Communication",
        "Web Development",
        "Other",
      ],
    },
    description: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      enum: ["Online", "Offline", "Both"],
    },
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Skill", skillSchema);
