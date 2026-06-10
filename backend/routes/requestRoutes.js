const express = require("express");
const {
  createRequest,
  getSentRequests,
  getReceivedRequests,
  updateRequestStatus,
  scheduleRequest,
  updateRequestProgress,
} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, createRequest);
router.get("/sent", protect, getSentRequests);
router.get("/received", protect, getReceivedRequests);
router.put("/:id/status", protect, updateRequestStatus);
router.put("/:id/schedule", protect, scheduleRequest);
router.put("/:id/progress", protect, updateRequestProgress);

module.exports = router;
