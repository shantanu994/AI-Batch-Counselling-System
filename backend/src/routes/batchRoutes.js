const express = require("express");
const { body } = require("express-validator");
const {
  listBatches,
  createBatch,
  updateBatch,
  deleteBatch,
  autoAssignStudents,
} = require("../controllers/batchController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");

const router = express.Router();

router.use(authenticate);

router.get("/", authorize("admin", "counsellor"), listBatches);

router.post(
  "/",
  authorize("admin"),
  [
    body("name").notEmpty(),
    body("type").isIn([
      "Regular Batch",
      "Remedial Batch",
      "Advanced Batch",
      "Special Monitoring Batch",
    ]),
    body("capacity").isInt({ min: 1 }),
  ],
  validateRequest,
  createBatch
);

router.put("/:id", authorize("admin"), updateBatch);
router.delete("/:id", authorize("admin"), deleteBatch);
router.post("/auto-assign", authorize("admin"), autoAssignStudents);

module.exports = router;
