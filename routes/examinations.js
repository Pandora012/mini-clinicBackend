const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth");
const { examinationValidation, medicalActionValidation, prescriptionValidation } = require("../validations/examinationValidation");
const validate = require("../middleware/validation");
const { getExaminationByRegistrationId, createExamination, updateExamination, getPatientHistory, addMedicalAction, addPrescription, completeExamination } = require("../controllers/examinationController");

router.get("/registration/:registration_id", authMiddleware, getExaminationByRegistrationId);
router.get("/patient/:patient_id/history", authMiddleware, getPatientHistory);
router.post("/", authMiddleware, authorize("Administrator"), examinationValidation, validate, createExamination);
router.put("/:id", authMiddleware, authorize("Administrator"), examinationValidation, validate, updateExamination);
router.post("/medical-actions", authMiddleware, authorize("Administrator"), medicalActionValidation, validate, addMedicalAction);
router.post("/prescriptions", authMiddleware, authorize("Administrator"), prescriptionValidation, validate, addPrescription);
router.put("/:id/complete", authMiddleware, authorize("Administrator"), completeExamination);

module.exports = router;
