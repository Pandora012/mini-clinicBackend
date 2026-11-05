const express = require("express");
const router = express.Router();
const { authMiddleware, authorize } = require("../middleware/auth");
const { registrationValidation } = require("../validations/registrationValidation");
const validate = require("../middleware/validation");
const { getAllRegistrations, getRegistrationById, createRegistration, updateRegistration, deleteRegistration } = require("../controllers/registrationController");

router.get("/", authMiddleware, require("../middleware/pagination"), getAllRegistrations);
router.get("/:id", authMiddleware, getRegistrationById);
router.post("/", authMiddleware, authorize("Administrator", "Petugas Pendaftaran"), registrationValidation, validate, createRegistration);
router.put("/:id", authMiddleware, authorize("Administrator", "Petugas Pendaftaran"), registrationValidation, validate, updateRegistration);
router.delete("/:id", authMiddleware, authorize("Administrator"), deleteRegistration);

module.exports = router;
