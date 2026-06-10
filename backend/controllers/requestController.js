const SessionRequest = require("../models/SessionRequest");
const Notification = require("../models/Notification");

const createRequest = async (req, res) => {
  try {
    const { skillId, message } = req.body;

    if (!skillId) {
      return res.status(400).json({ error: "Skill ID is required" });
    }

    const skill = await require("../models/Skill").findById(skillId);
    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    const existingRequest = await SessionRequest.findOne({
      skill: skillId,
      requester: req.user._id,
      status: "Pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({ error: "You already have a pending request for this skill" });
    }

    const request = await SessionRequest.create({
      skill: skillId,
      requester: req.user._id,
      owner: skill.offeredBy,
      message: message || "",
    });

    // Notify skill owner
    try {
      await Notification.create({
        user: skill.offeredBy,
        message: `${req.user.name} requested your skill "${skill.title}".`,
        type: "request",
      });
    } catch (e) {
      // ignore notification errors
    }

    const populatedRequest = await request.populate([
      { path: "skill" },
      { path: "requester", select: "name email" },
      { path: "owner", select: "name email" },
    ]);

    res.status(201).json({
      success: true,
      request: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSentRequests = async (req, res) => {
  try {
    const requests = await SessionRequest.find({
      requester: req.user._id,
    }).populate([
      { path: "skill" },
      { path: "owner", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReceivedRequests = async (req, res) => {
  try {
    const requests = await SessionRequest.find({
      owner: req.user._id,
    }).populate([
      { path: "skill" },
      { path: "requester", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRequestStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Pending", "Accepted", "Scheduled", "Rejected", "Completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const request = await SessionRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    const isOwner = request.owner.toString() === req.user._id.toString();
    const isRequester = request.requester.toString() === req.user._id.toString();

    if (!isOwner && !(status === "Completed" && isRequester)) {
      return res
        .status(403)
        .json({ error: "Only skill owner can update status (learners may only mark completed)." });
    }

    request.status = status;
    if (status === "Completed") {
      request.progressStatus = "Completed";
    }
    await request.save();

    // Notify requester about status change
    try {
      await Notification.create({
        user: request.requester,
        message: `Your request for skill has been updated to ${status} by the owner.`,
        type: "status",
      });
    } catch (e) {}

    const populatedRequest = await request.populate([
      { path: "skill" },
      { path: "requester", select: "name email" },
      { path: "owner", select: "name email" },
    ]);

    res.status(200).json({
      success: true,
      request: populatedRequest,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  updateRequestStatus,
  scheduleRequest,
  updateRequestProgress,
};

async function scheduleRequest(req, res) {
  try {
    const { scheduledDate, scheduledTime, meetingMode, meetingLink, location } = req.body;

    const request = await SessionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only skill owner can schedule session" });
    }

    if (scheduledDate) request.scheduledDate = scheduledDate;
    if (scheduledTime) request.scheduledTime = scheduledTime;
    if (meetingMode) request.meetingMode = meetingMode;
    if (meetingLink) request.meetingLink = meetingLink;
    if (location) request.location = location;

    request.status = "Scheduled";
    await request.save();

    // Notify requester about scheduled session
    try {
      const msgParts = [`Your session for "${populatedRequest.skill.title}" has been scheduled.`];
      if (request.scheduledDate) msgParts.push(`Date: ${new Date(request.scheduledDate).toLocaleDateString()}`);
      if (request.scheduledTime) msgParts.push(`Time: ${request.scheduledTime}`);
      if (request.meetingMode) msgParts.push(`Mode: ${request.meetingMode}`);
      await Notification.create({
        user: request.requester,
        message: msgParts.join(" "),
        type: "scheduled",
      });
    } catch (e) {}

    const populatedRequest = await request.populate([
      { path: "skill" },
      { path: "requester", select: "name email" },
      { path: "owner", select: "name email" },
    ]);

    res.status(200).json({ success: true, request: populatedRequest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateRequestProgress(req, res) {
  try {
    const { progressStatus, learnerNotes, mentorNotes, resources } = req.body;
    const request = await SessionRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    // Only requester or owner can update respective notes
    if (learnerNotes !== undefined) {
      if (request.requester.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Only learner can update learner notes" });
      request.learnerNotes = learnerNotes;
    }
    if (mentorNotes !== undefined) {
      if (request.owner.toString() !== req.user._id.toString())
        return res.status(403).json({ error: "Only mentor can update mentor notes" });
      request.mentorNotes = mentorNotes;
    }
    if (progressStatus) request.progressStatus = progressStatus;
    if (resources) request.resources = resources;

    await request.save();
    const populated = await request.populate([
      { path: "skill" },
      { path: "requester", select: "name email" },
      { path: "owner", select: "name email" },
    ]);
    res.status(200).json({ success: true, request: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

