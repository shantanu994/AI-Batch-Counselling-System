const express = require("express");
const { exportStudentPdf, exportStudentsExcel } = require("../controllers/reportController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authenticate, authorize("admin", "counsellor"));

router.get("/student/:studentId/pdf", exportStudentPdf);
router.get("/students/excel", exportStudentsExcel);

module.exports = router;
