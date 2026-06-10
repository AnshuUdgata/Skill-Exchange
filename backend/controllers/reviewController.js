const Review = require("../models/Review");
const SessionRequest = require("../models/SessionRequest");
const Notification = require("../models/Notification");

const createReview = async (req, res) => {
  try {
    const { sessionRequestId, rating, comment } = req.body;

    if (!sessionRequestId || !rating) {
      return res.status(400).json({ error: "sessionRequestId and rating are required" });
    }

    const session = await SessionRequest.findById(sessionRequestId);
    if (!session) return res.status(404).json({ error: "Session request not found" });

    if (session.status !== "Completed") {
      return res.status(400).json({ error: "Can only review completed sessions" });
    }

    // Only requester (learner) can submit review
    if (session.requester.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Only the learner can submit a review" });
    }

    // Prevent duplicate review for same session
    const existing = await Review.findOne({ sessionRequest: sessionRequestId });
    if (existing) return res.status(400).json({ error: "Review already submitted for this session" });

    const review = await Review.create({
      sessionRequest: sessionRequestId,
      skill: session.skill,
      mentor: session.owner,
      learner: session.requester,
      rating,
      comment: comment || "",
    });

    const populated = await review.populate([
      { path: "mentor", select: "name email" },
      { path: "learner", select: "name email" },
      { path: "skill" },
    ]);

    // Notify mentor about new review
    try {
      await Notification.create({
        user: populated.mentor._id,
        message: `${populated.learner.name} left a ${rating}-star review for your skill ${populated.skill.title}.`,
        type: "review",
      });
    } catch (e) {}

    res.status(201).json({ success: true, review: populated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewsByMentor = async (req, res) => {
  try {
    const reviews = await Review.find({ mentor: req.params.mentorId }).populate([
      { path: "learner", select: "name" },
      { path: "skill", select: "title" },
    ]);
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getReviewsBySkill = async (req, res) => {
  try {
    const reviews = await Review.find({ skill: req.params.skillId }).populate([
      { path: "learner", select: "name" },
      { path: "mentor", select: "name" },
    ]);
    res.status(200).json({ success: true, reviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createReview, getReviewsByMentor, getReviewsBySkill };
