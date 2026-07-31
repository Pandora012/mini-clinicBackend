const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const { clinicValidation } = require('../validations/clinicValidation');
const validate = require('../middleware/validation');
const {
  getAllClinics,
  getClinicById,
  createClinic,
  updateClinic,
  deleteClinic
} = require('../controllers/clinicController');

router.get('/', authMiddleware, getAllClinics);
router.get('/:id', authMiddleware, getClinicById);
router.post('/', authMiddleware, authorize('Administrator'), clinicValidation, validate, createClinic);
router.put('/:id', authMiddleware, authorize('Administrator'), clinicValidation, validate, updateClinic);
router.delete('/:id', authMiddleware, authorize('Administrator'), deleteClinic);

module.exports = router;