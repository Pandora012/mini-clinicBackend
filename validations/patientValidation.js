const { body } = require('express-validator');

const patientValidation = [
  body('nik')
    .notEmpty().withMessage('NIK is required')
    .isLength({ min: 16, max: 16 }).withMessage('NIK must be 16 digits')
    .isNumeric().withMessage('NIK must contain only numbers'),
  body('name').notEmpty().withMessage('Name is required'),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Laki-laki', 'Perempuan']).withMessage('Gender must be Laki-laki or Perempuan'),
  body('birth_date').notEmpty().withMessage('Birth date is required').isISO8601(),
  body('phone')
    .notEmpty().withMessage('Phone is required')
    .isLength({ min: 10, max: 20 }).withMessage('Phone number must be between 10-20 digits'),
  body('address').notEmpty().withMessage('Address is required')
];

module.exports = { patientValidation };