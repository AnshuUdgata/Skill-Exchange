const express = require("express");
const { getTrendingSkills, getRecommendedSkills, getAdminStats } = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/trending", getTrendingSkills);
router.get("/recommended", protect, getRecommendedSkills);
router.get("/admin/stats", protect, getAdminStats);

module.exports = router;
