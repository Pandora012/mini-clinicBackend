const { body } = require('express-validator');

const clinicValidation = [
  body('clinic_name').notEmpty().withMessage('Clinic name is required')
];

module.exports = { clinicValidation };