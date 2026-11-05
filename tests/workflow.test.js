const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const sequelize = require('../config/sequelize');
const models = require('../models');
const controller = require('../controllers/examinationController');
const { clinicDate } = require('../helpers/clinicDate');
const { canTransition } = require('../helpers/workflow');
const { getAllRegistrations } = require('../controllers/registrationController');
afterEach(() => mock.restoreAll());
const response = () => ({ code: 200, body: null, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } });
const transaction = { LOCK: { UPDATE: 'UPDATE' } };
const setupExam = ({ existing = null, status = 'Check In', failPrescription = false } = {}) => {
  const registration = { id: 12, status, update: mock.fn(async (data, options) => { assert.equal(options.transaction, transaction); Object.assign(registration, data); }) };
  let committed = false;
  let rolledBack = false;
  mock.method(sequelize, 'transaction', async work => { try { const value = await work(transaction); committed = true; return value; } catch (error) { rolledBack = true; throw error; } });
  mock.method(models.Registration, 'findByPk', async (_id, options) => { assert.equal(options.lock, 'UPDATE'); return registration; });
  mock.method(models.Examination, 'findOne', async () => existing);
  mock.method(models.Examination, 'create', async (values, options) => { assert.equal(options.transaction, transaction); return { ...values, id: 7 }; });
  mock.method(models.Examination, 'findByPk', async (_id, options) => { assert.equal(options.transaction, transaction); return { id: 7 }; });
  for (const Model of [models.MedicalAction, models.Prescription]) {
    mock.method(Model, 'destroy', async options => { assert.equal(options.transaction, transaction); });
    mock.method(Model, 'bulkCreate', async (_values, options) => {
      assert.equal(options.transaction, transaction);
      if (Model === models.Prescription && failPrescription) throw Object.assign(new Error('Resep gagal disimpan'), { status: 422 });
    });
  }
  return { registration, committed: () => committed, rolledBack: () => rolledBack };
};
const payload = { registration_id: 12, diagnosis: 'Diagnosis uji', body_weight: '', medical_actions: [{ action_name: 'Tindakan', notes: '' }], prescriptions: [{ medicine_name: 'Obat', dosage: '1', instruction: 'Sesuai resep' }] };

test('clinic day changes at Jakarta midnight, independently of UTC', () => {
  assert.equal(clinicDate(new Date('2026-11-02T16:59:59Z')), '2026-11-02');
  assert.equal(clinicDate(new Date('2026-11-02T17:00:00Z')), '2026-11-03');
});
test('queue workflow rejects skips, reversals and reopening a completed visit', () => {
  assert.equal(canTransition('Menunggu', 'Check In'), true);
  assert.equal(canTransition('Menunggu', 'Selesai'), false);
  assert.equal(canTransition('Pemeriksaan', 'Menunggu'), false);
  assert.equal(canTransition('Selesai', 'Pemeriksaan'), false);
});
test('saving SOAP, actions, prescriptions and visit status uses one transaction', async () => {
  const state = setupExam(); const res = response();
  await controller.createExamination({ body: payload }, res);
  assert.equal(res.code, 201); assert.equal(state.committed(), true);
  assert.equal(state.registration.status, 'Pemeriksaan');
  assert.equal(models.Examination.create.mock.calls[0].arguments[0].body_weight, null);
});
test('failed prescription aborts save before changing visit status', async () => {
  const state = setupExam({ failPrescription: true }); const res = response();
  await controller.createExamination({ body: payload }, res);
  assert.equal(res.code, 422); assert.equal(state.rolledBack(), true); assert.equal(state.committed(), false);
  assert.equal(state.registration.update.mock.calls.length, 0);
});
test('a second create for the same registration is rejected', async () => {
  setupExam({ existing: { id: 7 } }); const res = response();
  await controller.createExamination({ body: payload }, res);
  assert.equal(res.code, 409); assert.equal(models.Examination.create.mock.calls.length, 0);
});
test('editing replaces collections rather than appending duplicates', async () => {
  const existing = { id: 7, update: mock.fn(async (_data, options) => { assert.equal(options.transaction, transaction); return existing; }) };
  setupExam({ existing, status: 'Pemeriksaan' });
  for (let i = 0; i < 2; i++) {
    const res = response(); await controller.updateExamination({ params: { id: 7 }, body: payload }, res); assert.equal(res.code, 200);
  }
  assert.equal(models.Prescription.destroy.mock.calls.length, 2);
  assert.equal(models.Prescription.bulkCreate.mock.calls.length, 2);
  assert.equal(models.Examination.create.mock.calls.length, 0);
});
test('completed visit cannot be changed by another save', async () => {
  setupExam({ status: 'Selesai' }); const res = response();
  await controller.createExamination({ body: payload }, res);
  assert.equal(res.code, 409); assert.equal(models.Examination.create.mock.calls.length, 0);
});
test('searching registrations keeps doctor and clinic associations', async () => {
  mock.method(models.Registration, 'findAndCountAll', async options => {
    assert.deepEqual(options.include.map(item => item.as), ['patient', 'doctor', 'clinic']);
    return { count: 0, rows: [] };
  });
  const res = response(); await getAllRegistrations({ query: { search: 'Test' } }, res);
  assert.equal(res.code, 200);
});

test('completion requires a diagnosis and leaves the registration open on failure', async () => {
  const visit = { status: 'Pemeriksaan', update: mock.fn() };
  const exam = { registration_id: 12, diagnosis: '', reload: mock.fn(async options => assert.equal(options.lock, 'UPDATE')) };
  mock.method(sequelize, 'transaction', work => work(transaction));
  mock.method(models.Examination, 'findByPk', async () => exam);
  mock.method(models.Registration, 'findByPk', async () => visit);
  const res = response(); await controller.completeExamination({ params: { id: 7 } }, res);
  assert.equal(res.code, 422); assert.equal(visit.update.mock.calls.length, 0);
});
test('completing twice is idempotent and does not reopen the visit', async () => {
  const visit = { status: 'Selesai', update: mock.fn() };
  mock.method(sequelize, 'transaction', work => work(transaction));
  mock.method(models.Examination, 'findByPk', async () => ({ registration_id: 12 }));
  mock.method(models.Registration, 'findByPk', async () => visit);
  const res = response(); await controller.completeExamination({ params: { id: 7 } }, res);
  assert.equal(res.code, 200); assert.equal(visit.update.mock.calls.length, 0);
});
