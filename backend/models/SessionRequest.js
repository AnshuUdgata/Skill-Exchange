const mongoose = require("mongoose");

const sessionRequestSchema = new mongoose.Schema(
  {
    skill: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Skill",
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "",
    },
    // Scheduling fields
    scheduledDate: {
      type: Date,
    },
    scheduledTime: {
      type: String,
    },
    meetingMode: {
      type: String,
      enum: ["Online", "Offline"],
    },
    meetingLink: {
      type: String,
    },
    location: {
      type: String,
    },
    // Learning progress
    progressStatus: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    learnerNotes: {
      type: String,
    },
    mentorNotes: {
      type: String,
    },
    resources: [String],

    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Accepted", "Scheduled", "Completed", "Rejected"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SessionRequest", sessionRequestSchema);
