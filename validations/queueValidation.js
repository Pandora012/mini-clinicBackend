const { body } = require('express-validator');

const queueStatusValidation = [
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['Menunggu', 'Check In', 'Pemeriksaan', 'Selesai']).withMessage('Invalid status')
];

module.exports = { queueStatusValidation };