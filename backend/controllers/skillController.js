const Skill = require("../models/Skill");

const createSkill = async (req, res) => {
  try {
    const { title, category, description, mode } = req.body;

    if (!title || !category || !description || !mode) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const skill = await Skill.create({
      title,
      category,
      description,
      mode,
      offeredBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      skill,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllSkills = async (req, res) => {
  try {
    // Query params
    const { search, category, mode, sort = "newest", page = 1, limit = 10 } = req.query;
    const pageNum = Number(page) || 1;
    const lim = Number(limit) || 10;

    const match = {};
    if (search) {
      match.title = { $regex: search, $options: "i" };
    }
    if (category) {
      match.category = category;
    }
    if (mode) {
      match.mode = { $in: [mode, "Both"] };
    }

    // Base pipeline to compute aggregates
    const pipeline = [{ $match: match }];

    // Lookup reviews to compute average rating
    pipeline.push({
      $lookup: {
        from: "reviews",
        localField: "_id",
        foreignField: "skill",
        as: "reviews",
      },
    });
    pipeline.push({
      $addFields: {
        avgRating: { $avg: "$reviews.rating" },
        reviewsCount: { $size: "$reviews" },
      },
    });

    // Lookup session requests to compute popularity
    pipeline.push({
      $lookup: {
        from: "sessionrequests",
        localField: "_id",
        foreignField: "skill",
        as: "requests",
      },
    });
    pipeline.push({ $addFields: { requestCount: { $size: "$requests" } } });

    // Join offeredBy
    pipeline.push({
      $lookup: {
        from: "users",
        localField: "offeredBy",
        foreignField: "_id",
        as: "offeredBy",
      },
    });
    pipeline.push({ $unwind: { path: "$offeredBy", preserveNullAndEmptyArrays: true } });

    // Sorting
    const sortStage = {};
    if (sort === "rating") sortStage.avgRating = -1;
    else if (sort === "popular") sortStage.requestCount = -1;
    else sortStage.createdAt = -1; // newest

    pipeline.push({ $sort: sortStage });

    // Pagination
    pipeline.push({ $skip: (pageNum - 1) * lim });
    pipeline.push({ $limit: lim });

    // Final projection
    pipeline.push({
      $project: {
        title: 1,
        category: 1,
        description: 1,
        mode: 1,
        offeredBy: { _id: "$offeredBy._id", name: "$offeredBy.name", email: "$offeredBy.email" },
        avgRating: { $ifNull: ["$avgRating", 0] },
        reviewsCount: 1,
        requestCount: 1,
        createdAt: 1,
      },
    });

    const skills = await Skill.aggregate(pipeline);

    // Total count for pagination (apply same match)
    const countPipeline = [];
    if (Object.keys(match).length > 0) countPipeline.push({ $match: match });
    countPipeline.push({ $count: "total" });
    const countRes = await Skill.aggregate(countPipeline);
    const total = countRes[0]?.total || 0;
    const totalPages = Math.ceil(total / lim) || 1;

    res.status(200).json({ success: true, skills, page: pageNum, totalPages, total });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMySkills = async (req, res) => {
  try {
    const skills = await Skill.find({ offeredBy: req.user._id }).populate(
      "offeredBy",
      "name email"
    );
    res.status(200).json({
      success: true,
      skills,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id).populate(
      "offeredBy",
      "name email"
    );

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    res.status(200).json({
      success: true,
      skill,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateSkill = async (req, res) => {
  try {
    let skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    if (skill.offeredBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Only owner can update this skill" });
    }

    skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      skill,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ error: "Skill not found" });
    }

    if (skill.offeredBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ error: "Only owner can delete this skill" });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Skill deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createSkill,
  getAllSkills,
  getMySkills,
  getSkillById,
  updateSkill,
  deleteSkill,
};
