const User = require("../models/User");
const Skill = require("../models/Skill");
const Review = require("../models/Review");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, photo, experience, branch, year, password } = req.body;
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use" });
      }
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (photo !== undefined) user.photo = photo;
    if (experience !== undefined) user.experience = experience;
    if (branch) user.branch = branch;
    if (year) user.year = year;
    if (password) user.password = password;

    await user.save();

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        photo: user.photo,
        experience: user.experience,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getInstructor = async (req, res) => {
  try {
    const instructor = await User.findById(req.params.id).select("-password");
    if (!instructor) return res.status(404).json({ error: "Instructor not found" });

    const skills = await Skill.aggregate([
      { $match: { offeredBy: instructor._id } },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "skill",
          as: "reviews",
        },
      },
      {
        $addFields: {
          avgRating: { $ifNull: [{ $avg: "$reviews.rating" }, 0] },
          reviewsCount: { $size: "$reviews" },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          category: 1,
          mode: 1,
          avgRating: 1,
          reviewsCount: 1,
        },
      },
    ]);

    const overallRatingAgg = await Review.aggregate([
      { $match: { mentor: instructor._id } },
      {
        $group: {
          _id: "$mentor",
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const overallRating = overallRatingAgg[0]?.avgRating || 0;
    const totalReviews = overallRatingAgg[0]?.totalReviews || 0;

    res.status(200).json({
      success: true,
      instructor: {
        id: instructor._id,
        name: instructor.name,
        email: instructor.email,
        branch: instructor.branch,
        year: instructor.year,
        photo: instructor.photo,
        experience: instructor.experience,
      },
      overallRating,
      totalReviews,
      skills,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getInstructor,
};
