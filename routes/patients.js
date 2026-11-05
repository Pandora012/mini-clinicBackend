const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth");
const { patientValidation } = require("../validations/patientValidation");
const validate = require("../middleware/validation");
const { getAllPatients, getPatientById, createPatient, updatePatient, deletePatient } = require("../controllers/patientController");

router.get("/", authMiddleware, require("../middleware/pagination"), getAllPatients);
router.get("/:id", authMiddleware, getPatientById);
router.post("/", authMiddleware, authorize("Administrator", "Petugas Pendaftaran"), patientValidation, validate, createPatient);
router.put("/:id", authMiddleware, authorize("Administrator", "Petugas Pendaftaran"), patientValidation, validate, updatePatient);
router.delete("/:id", authMiddleware, authorize("Administrator"), deletePatient);

module.exports = router;
