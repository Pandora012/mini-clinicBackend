const sequelize = require('../config/sequelize');
const { Examination, Registration, Patient, MedicalAction, Prescription, Doctor, Clinic } = require('../models');

const includes = [
  { model: Registration, as: 'registration', include: [{ model: Patient, as: 'patient' }] },
  { model: MedicalAction, as: 'medical_actions' },
  { model: Prescription, as: 'prescriptions' },
];
const fail = (message, status = 409) => Object.assign(new Error(message), { status });
const respondError = (res, error) => {
  if (!error.status) console.error('[Examination]', error.name, error.parent?.code || 'UNEXPECTED_ERROR');
  return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Pemeriksaan gagal diproses. Silakan coba lagi.' });
};
const getExaminationByRegistrationId = async (req, res) => {
  try {
    const examination = await Examination.findOne({ where: { registration_id: req.params.registration_id }, include: includes });
    res.json({ success: true, data: examination });
  } catch (error) { respondError(res, error); }
};
const fields = ['complaint', 'blood_pressure', 'body_temperature', 'body_weight', 'body_height', 'diagnosis', 'therapy_plan'];
const saveExamination = async (req, res, isUpdate) => {
  try {
    const result = await sequelize.transaction(async transaction => {
      const registration = await Registration.findByPk(req.body.registration_id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!registration) throw fail('Pendaftaran tidak ditemukan.', 404);
      if (!['Check In', 'Pemeriksaan'].includes(registration.status)) throw fail('Pasien harus check in dan belum selesai diperiksa.');
      const existing = await Examination.findOne({ where: { registration_id: registration.id }, transaction });
      if (isUpdate && (!existing || String(existing.id) !== String(req.params.id))) throw fail('Pemeriksaan tidak ditemukan.', 404);
      if (!isUpdate && existing) throw fail('Pemeriksaan sudah dibuat. Muat ulang halaman untuk melanjutkan.');
      const values = Object.fromEntries(fields.filter(key => req.body[key] !== undefined).map(key => [key, req.body[key] === '' ? null : req.body[key]]));
      const examination = isUpdate
        ? await existing.update(values, { transaction })
        : await Examination.create({ ...values, registration_id: registration.id }, { transaction });
      // Replace the submitted collection once, inside the same transaction as the SOAP record.
      if (Array.isArray(req.body.medical_actions)) {
        await MedicalAction.destroy({ where: { examination_id: examination.id }, transaction });
        if (req.body.medical_actions.length) await MedicalAction.bulkCreate(req.body.medical_actions.map(action => ({ examination_id: examination.id, action_name: action.action_name, notes: action.notes })), { transaction });
      }
      if (Array.isArray(req.body.prescriptions)) {
        await Prescription.destroy({ where: { examination_id: examination.id }, transaction });
        if (req.body.prescriptions.length) await Prescription.bulkCreate(req.body.prescriptions.map(rx => ({ examination_id: examination.id, medicine_name: rx.medicine_name, dosage: rx.dosage, instruction: rx.instruction })), { transaction });
      }
      await registration.update({ status: 'Pemeriksaan' }, { transaction });
      return Examination.findByPk(examination.id, { include: includes, transaction });
    });
    res.status(isUpdate ? 200 : 201).json({ success: true, message: 'Pemeriksaan berhasil disimpan.', data: result });
  } catch (error) { respondError(res, error); }
};
const createExamination = (req, res) => saveExamination(req, res, false);
const updateExamination = (req, res) => saveExamination(req, res, true);
const getPatientHistory = async (req, res) => {
  try {
    const examinations = await Examination.findAll({
      include: [
        { model: Registration, as: 'registration', where: { patient_id: req.params.patient_id }, include: [{ model: Doctor, as: 'doctor' }, { model: Clinic, as: 'clinic' }] },
        { model: MedicalAction, as: 'medical_actions' }, { model: Prescription, as: 'prescriptions' },
      ], order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: examinations });
  } catch (error) { respondError(res, error); }
};
// Retain existing endpoints for clients, while rejecting writes to completed records.
const appendItem = (Model, keys) => async (req, res) => {
  try {
    const item = await sequelize.transaction(async transaction => {
      const examination = await Examination.findByPk(req.body.examination_id, { transaction });
      if (!examination) throw fail('Pemeriksaan tidak ditemukan.', 404);
      const registration = await Registration.findByPk(examination.registration_id, { transaction, lock: transaction.LOCK.UPDATE });
      if (registration.status !== 'Pemeriksaan') throw fail('Pemeriksaan sudah ditutup.');
      return Model.create(Object.fromEntries(keys.map(key => [key, req.body[key]])), { transaction });
    });
    res.status(201).json({ success: true, data: item });
  } catch (error) { respondError(res, error); }
};
const addMedicalAction = appendItem(MedicalAction, ['examination_id', 'action_name', 'notes']);
const addPrescription = appendItem(Prescription, ['examination_id', 'medicine_name', 'dosage', 'instruction']);
const completeExamination = async (req, res) => {
  try {
    await sequelize.transaction(async transaction => {
      const examination = await Examination.findByPk(req.params.id, { transaction });
      if (!examination) throw fail('Pemeriksaan tidak ditemukan.', 404);
      const registration = await Registration.findByPk(examination.registration_id, { transaction, lock: transaction.LOCK.UPDATE });
      if (registration.status === 'Selesai') return;
      if (registration.status !== 'Pemeriksaan') throw fail('Pasien belum dalam pemeriksaan.');
      // Re-read after locking registration so a concurrent save cannot leave completion stale.
      await examination.reload({ transaction, lock: transaction.LOCK.UPDATE });
      if (!examination.diagnosis?.trim()) throw fail('Lengkapi diagnosis sebelum menyelesaikan pemeriksaan.', 422);
      await registration.update({ status: 'Selesai' }, { transaction });
    });
    res.json({ success: true, message: 'Pemeriksaan selesai.' });
  } catch (error) { respondError(res, error); }
};
module.exports = { getExaminationByRegistrationId, createExamination, updateExamination, getPatientHistory, addMedicalAction, addPrescription, completeExamination };
