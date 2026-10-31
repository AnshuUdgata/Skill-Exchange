const User = require("../models/User");
const Skill = require("../models/Skill");
const Review = require("../models/Review");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

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

/**
 * Upload profile photo to Cloudinary
 * Replaces previous Cloudinary image after database save succeeds
 */
const uploadProfilePhotoController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please provide an image file to upload." });
    }

    if (!isCloudinaryConfigured()) {
      return res.status(500).json({
        error: "Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in backend environment.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const previousPublicId = user.photoPublicId;

    // Stream upload directly to Cloudinary from memory buffer
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "campus-skill-exchange/profiles",
          resource_type: "image",
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, uploadResult) => {
          if (error) return reject(error);
          resolve(uploadResult);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    // Save Cloudinary URL and publicId in user document
    user.photo = result.secure_url;
    user.photoPublicId = result.public_id;
    await user.save();

    // Clean up previous image from Cloudinary only after database update succeeds
    if (previousPublicId) {
      try {
        await cloudinary.uploader.destroy(previousPublicId);
      } catch (cleanupErr) {
        console.warn("Could not delete previous Cloudinary image:", cleanupErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile photo updated successfully.",
      photo: user.photo,
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
    res.status(500).json({ error: error.message || "Failed to upload profile photo." });
  }
};

/**
 * Remove profile photo and revert to default avatar
 */
const deleteProfilePhotoController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const previousPublicId = user.photoPublicId;

    user.photo = "";
    user.photoPublicId = "";
    await user.save();

    if (previousPublicId && isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(previousPublicId);
      } catch (cleanupErr) {
        console.warn("Could not delete previous Cloudinary image:", cleanupErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: "Profile photo removed successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        photo: "",
        experience: user.experience,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message || "Failed to remove profile photo." });
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
  uploadProfilePhotoController,
  deleteProfilePhotoController,
  getInstructor,
};
