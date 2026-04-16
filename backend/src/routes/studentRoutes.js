const express = require("express");
const { body } = require("express-validator");
const {
  listStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} = require("../controllers/studentController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "counsellor"), listStudents);
router.get("/:id", authorize("admin", "counsellor", "student"), getStudentById);

router.post(
  "/",
  authorize("admin", "counsellor"),
  [
    body("roll_no").notEmpty(),
    body("name").notEmpty(),
    body("email").isEmail(),
    body("academic_score").isFloat({ min: 0, max: 100 }),
    body("attendance_percentage").isFloat({ min: 0, max: 100 }),
    body("learning_ability").isIn(["Fast", "Moderate", "Slow"]),
    body("behaviour_score").isFloat({ min: 0, max: 100 }),
  ],
  validateRequest,
  createStudent
);

router.put("/:id", authorize("admin", "counsellor"), updateStudent);
router.delete("/:id", authorize("admin"), deleteStudent);

module.exports = router;
