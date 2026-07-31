const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth");
const { queueStatusValidation } = require("../validations/queueValidation");
const validate = require("../middleware/validation");
const { getTodayQueues, getNextQueue, updateQueueStatus, getQueueHistory } = require("../controllers/queueController");

router.get("/today", authMiddleware, getTodayQueues);
router.get("/next", authMiddleware, authorize("Administrator", "Petugas Pendaftaran"), getNextQueue);
router.get("/history", authMiddleware, getQueueHistory);
router.put("/:id/status", authMiddleware, authorize("Administrator", "Petugas Pendaftaran"), queueStatusValidation, validate, updateQueueStatus);

module.exports = router;
