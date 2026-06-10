const Skill = require("../models/Skill");
const SessionRequest = require("../models/SessionRequest");
const User = require("../models/User");

// Get trending skills by request count
const getTrendingSkills = async (req, res) => {
  try {
    const pipeline = [
      { $match: { status: { $ne: "Rejected" } } },
      { $group: { _id: "$skill", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "skills",
          localField: "_id",
          foreignField: "_id",
          as: "skill",
        },
      },
      { $unwind: "$skill" },
      { $project: { _id: "$skill._id", title: "$skill.title", category: "$skill.category", count: 1 } },
    ];

    const results = await SessionRequest.aggregate(pipeline);
    res.status(200).json({ success: true, trending: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Simple rule-based recommendations
const getRecommendedSkills = async (req, res) => {
  try {
    const userId = req.user?._id;
    const user = userId ? await User.findById(userId) : null;

    // Start with trending
    const trendingResp = await SessionRequest.aggregate([
      { $match: { status: { $ne: "Rejected" } } },
      { $group: { _id: "$skill", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]);

    const trendingSkillIds = trendingResp.map((r) => r._id);

    // If we have a user, boost skills by branch/year keywords and past requests
    let recommendedIds = [...trendingSkillIds];

    if (user) {
      const branchKeywords = user.branch ? [user.branch] : [];

      const past = await SessionRequest.find({ requester: userId }).limit(20).select("skill");
      const pastIds = past.map((p) => p.skill.toString());

      // Prepend past requested skills
      recommendedIds = [...new Set([...pastIds, ...recommendedIds.map(String)])];
    }

    const skills = await Skill.find({ _id: { $in: recommendedIds } }).limit(12);
    res.status(200).json({ success: true, recommended: skills });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin stats
const getAdminStats = async (req, res) => {
  try {
    const totalSkills = await Skill.countDocuments();
    const totalRequests = await SessionRequest.countDocuments();
    const completedSessions = await SessionRequest.countDocuments({ status: "Completed" });
    const totalUsers = await User.countDocuments();

    // Top mentors by accepted/scheduled sessions
    const topMentors = await SessionRequest.aggregate([
      { $match: { status: { $in: ["Accepted", "Scheduled", "Completed"] } } },
      { $group: { _id: "$owner", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" },
      },
      { $unwind: "$user" },
      { $project: { _id: "$user._id", name: "$user.name", count: 1 } },
    ]);

    res.status(200).json({
      success: true,
      stats: { totalSkills, totalRequests, completedSessions, totalUsers, topMentors },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTrendingSkills, getRecommendedSkills, getAdminStats };
