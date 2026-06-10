const Notification = require("../models/Notification");

const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const notes = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ success: true, notifications: notes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const note = await Notification.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Notification not found" });
    if (note.user.toString() !== req.user._id.toString()) return res.status(403).json({ error: "Not allowed" });
    note.isRead = true;
    await note.save();
    res.status(200).json({ success: true, notification: note });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getNotifications, markRead };
