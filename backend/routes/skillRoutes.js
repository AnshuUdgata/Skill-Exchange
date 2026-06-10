const express = require("express");
const {
  createSkill,
  getAllSkills,
  getMySkills,
  getSkillById,
  updateSkill,
  deleteSkill,
} = require("../controllers/skillController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createSkill);
router.get("/", getAllSkills);
router.get("/my-skills", protect, getMySkills);
router.get("/:id", getSkillById);
router.put("/:id", protect, updateSkill);
router.delete("/:id", protect, deleteSkill);

module.exports = router;
