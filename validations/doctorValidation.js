const { body } = require('express-validator');

const doctorValidation = [
  body('doctor_name').notEmpty().withMessage('Doctor name is required'),
  body('specialization').notEmpty().withMessage('Specialization is required')
];

module.exports = { doctorValidation };