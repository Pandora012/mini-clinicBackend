const sequelize = require('../config/sequelize');
const NumberSequence = require('../models/NumberSequence');
const { QueryTypes } = require('sequelize');
const { clinicDate } = require('./clinicDate');

// Allocate under a row lock held until the patient/registration transaction commits.
// Seed from historical records to preserve numbering when upgrading existing clinics.
const nextNumber = async (name, sql, replacements, transaction) => {
  if (!transaction) throw new Error('Number allocation requires a transaction');
  await sequelize.query(
    'INSERT INTO `number_sequences` (`name`, `last_value`) VALUES (:name, 0) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`)',
    { replacements: { name }, transaction },
  );
  const sequence = await NumberSequence.findByPk(name, { transaction, lock: transaction.LOCK.UPDATE });
  const [row] = await sequelize.query(sql, { replacements, transaction, type: QueryTypes.SELECT });
  const value = Math.max(sequence.last_value, Number(row.maximum) || 0) + 1;
  await sequence.update({ last_value: value }, { transaction });
  return value;
};
const generateMedicalRecordNumber = async transaction => {
  const value = await nextNumber('medical-record',
    'SELECT MAX(CAST(SUBSTRING(medical_record_number, 3) AS UNSIGNED)) AS maximum FROM patients', {}, transaction);
  return `RM${String(value).padStart(6, '0')}`;
};
const generateQueueNumber = async (visitDate = clinicDate(), transaction) => {
  const value = await nextNumber(`queue:${visitDate}`,
    'SELECT MAX(CAST(SUBSTRING(queue_number, 2) AS UNSIGNED)) AS maximum FROM registrations WHERE visit_date = :date',
    { date: visitDate }, transaction);
  return `A${String(value).padStart(3, '0')}`;
};
module.exports = { generateMedicalRecordNumber, generateQueueNumber };
