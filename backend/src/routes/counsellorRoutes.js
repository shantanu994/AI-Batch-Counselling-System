const express = require("express");
const { body } = require("express-validator");
const {
  listCounsellors,
  getAssignedStudents,
  addFeedback,
  scheduleSession,
} = require("../controllers/counsellorController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin"), listCounsellors);
router.get("/assigned-students", authorize("admin", "counsellor"), getAssignedStudents);

router.post(
  "/feedback",
  authorize("counsellor", "admin"),
  [
    body("student_id").isInt({ min: 1 }),
    body("feedback_text").notEmpty(),
    body("progress_rating").isFloat({ min: 0, max: 10 }),
  ],
  validateRequest,
  addFeedback
);

router.post(
  "/schedule-session",
  authorize("counsellor", "admin"),
  [
    body("student_id").isInt({ min: 1 }),
    body("scheduled_at").isISO8601(),
    body("agenda").notEmpty(),
  ],
  validateRequest,
  scheduleSession
);

module.exports = router;
