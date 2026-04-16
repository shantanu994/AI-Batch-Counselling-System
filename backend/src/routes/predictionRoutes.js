const express = require("express");
const { predictForStudent, bulkPredict } = require("../controllers/predictionController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate);

router.post("/student/:studentId", authorize("admin", "counsellor"), predictForStudent);
router.post("/bulk", authorize("admin"), bulkPredict);

module.exports = router;
