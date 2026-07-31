const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const { doctorValidation } = require('../validations/doctorValidation');
const validate = require('../middleware/validation');
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
} = require('../controllers/doctorController');

router.get('/', authMiddleware, getAllDoctors);
router.get('/:id', authMiddleware, getDoctorById);
router.post('/', authMiddleware, authorize('Administrator'), doctorValidation, validate, createDoctor);
router.put('/:id', authMiddleware, authorize('Administrator'), doctorValidation, validate, updateDoctor);
router.delete('/:id', authMiddleware, authorize('Administrator'), deleteDoctor);

module.exports = router;