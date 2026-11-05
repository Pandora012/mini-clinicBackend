const { body } = require('express-validator');
const examinationValidation = [
  body('registration_id').isInt({ min: 1 }).withMessage('Pendaftaran wajib dipilih.'),
  body('medical_actions').optional().isArray({ max: 100 }),
  body('medical_actions.*.action_name').trim().notEmpty().isLength({ max: 255 }),
  body('prescriptions').optional().isArray({ max: 100 }),
  body('prescriptions.*.medicine_name').trim().notEmpty().isLength({ max: 255 }),
  body('prescriptions.*.dosage').trim().notEmpty().withMessage('Dosis obat wajib diisi.'),
  body('prescriptions.*.instruction').trim().notEmpty().withMessage('Aturan pakai obat wajib diisi.'),
  body('body_weight').optional({ values: 'falsy' }).isFloat({ min: 0.1, max: 999.99 }),
  body('body_height').optional({ values: 'falsy' }).isFloat({ min: 1, max: 999.99 }),
  body('body_temperature').optional({ values: 'falsy' }).isFloat({ min: 20, max: 50 }),
];
const medicalActionValidation = [body('examination_id').isInt({ min: 1 }), body('action_name').trim().notEmpty()];
const prescriptionValidation = [body('examination_id').isInt({ min: 1 }), body('medicine_name').trim().notEmpty(), body('dosage').trim().notEmpty(), body('instruction').trim().notEmpty()];
module.exports = { examinationValidation, medicalActionValidation, prescriptionValidation };
