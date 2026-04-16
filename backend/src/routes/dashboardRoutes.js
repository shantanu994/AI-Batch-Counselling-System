const express = require("express");
const { getAdminStats } = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/admin", authenticate, authorize("admin"), getAdminStats);

module.exports = router;
