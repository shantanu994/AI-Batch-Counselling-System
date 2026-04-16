const express = require("express");
const {
  getNotifications,
  markNotificationRead,
} = require("../controllers/notificationController");
const { authenticate } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.get("/", getNotifications);
router.patch("/:id/read", markNotificationRead);

module.exports = router;
