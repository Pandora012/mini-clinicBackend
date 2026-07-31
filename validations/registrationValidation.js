const { body } = require('express-validator');

const registrationValidation = [
  body('patient_id').notEmpty().withMessage('Patient is required').isInt(),
  body('doctor_id').notEmpty().withMessage('Doctor is required').isInt(),
  body('clinic_id').notEmpty().withMessage('Clinic is required').isInt(),
  body('visit_date').notEmpty().withMessage('Visit date is required').isISO8601(),
  body('payment_type')
    .notEmpty().withMessage('Payment type is required')
    .isIn(['BPJS', 'UMUM', 'Asuransi']).withMessage('Invalid payment type')
];

module.exports = { registrationValidation };