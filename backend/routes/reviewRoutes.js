const express = require("express");
const { createReview, getReviewsByMentor, getReviewsBySkill } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createReview);
router.get("/mentor/:mentorId", getReviewsByMentor);
router.get("/skill/:skillId", getReviewsBySkill);

module.exports = router;
