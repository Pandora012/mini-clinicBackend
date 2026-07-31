const { body } = require('express-validator');

const examinationValidation = [
  body('registration_id').notEmpty().withMessage('Registration ID is required').isInt()
];

const medicalActionValidation = [
  body('examination_id').notEmpty().withMessage('Examination ID is required').isInt(),
  body('action_name').notEmpty().withMessage('Action name is required')
];

const prescriptionValidation = [
  body('examination_id').notEmpty().withMessage('Examination ID is required').isInt(),
  body('medicine_name').notEmpty().withMessage('Medicine name is required'),
  body('dosage').notEmpty().withMessage('Dosage is required'),
  body('instruction').notEmpty().withMessage('Instruction is required')
];

module.exports = { examinationValidation, medicalActionValidation, prescriptionValidation };