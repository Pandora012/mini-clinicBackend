const { body } = require('express-validator');

const registrationValidation = [
  body('patient_id').notEmpty().withMessage('Patient is required').isInt(),
  body('doctor_id').notEmpty().withMessage('Doctor is required').isInt(),
  body('clinic_id').notEmpty().withMessage('Clinic is required').isInt(),
  body('visit_date').notEmpty().withMessage('Visit date is required').isISO8601({ strict: true }).matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Gunakan tanggal kunjungan YYYY-MM-DD.'),
  body('payment_type')
    .notEmpty().withMessage('Payment type is required')
    .isIn(['BPJS', 'UMUM', 'Asuransi']).withMessage('Invalid payment type')
];

module.exports = { registrationValidation };
