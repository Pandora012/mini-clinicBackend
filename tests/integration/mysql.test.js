const { describe, test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Only this freshly created schema is ever dropped. The configured clinic is never selected.
const originalDatabase = process.env.DB_NAME;
const testDatabase = `mini_clinic_test_${Date.now()}_${require('node:crypto').randomBytes(4).toString('hex')}`;
let adminConnection, db, models, server, baseURL, ownsSchema = false;
let adminToken, doctorToken, staffToken, doctor, clinic, patients, visits, called;
const password = 'OnlyForIntegration123!';

const request = async (path, { method = 'GET', body, token = adminToken } = {}) => {
  const response = await fetch(`${baseURL}${path}`, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  return { status: response.status, body: await response.json() };
};
const expectStatus = (result, status) => {
  assert.equal(result.status, status, JSON.stringify(result.body));
  return result.body.data;
};
const login = async username => expectStatus(await request('/auth/login', { method: 'POST', body: { username, password }, token: null }), 200).token;
const examPayload = id => ({ registration_id: id, complaint: 'Catatan uji integrasi', diagnosis: 'Diagnosis pengujian', body_weight: '60', body_height: '165', medical_actions: [{ action_name: 'Tindakan pengujian', notes: 'Dummy' }], prescriptions: [{ medicine_name: 'Obat pengujian', dosage: 'Dosis pengujian', instruction: 'Aturan pengujian' }] });

describe('MySQL end-to-end using a disposable schema', { timeout: 60000 }, () => {
  before(async () => {
    assert.match(testDatabase, /^mini_clinic_test_\d+_[a-f0-9]{8}$/);
    assert.notEqual(testDatabase, originalDatabase);
    adminConnection = await mysql.createConnection({ host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306), user: process.env.DB_USER || 'root', password: process.env.DB_PASSWORD || '' });
    await adminConnection.query(`CREATE DATABASE \`${testDatabase}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    ownsSchema = true;
    process.env.DB_NAME = testDatabase;
    process.env.NODE_ENV = 'development';
    process.env.JWT_SECRET = 'integration-test-process-only';
    db = require('../../config/sequelize');
    models = require('../../models');
    const S = require('sequelize');
    const q = db.getQueryInterface();
    for (const file of ['20260730134802-create-users-table', '20261102000000-create-clinic-tables', '20261103000000-create-number-sequences', '20261103000001-unique-visit-records']) {
      await require(`../../migrations/${file}`).up(q, S);
    }
    await models.User.create({ name: 'Administrator QA', username: 'admin-qa', email: 'admin@example.test', role: 'Administrator', password: await bcrypt.hash(password, 4) });
    server = require('../../app').listen(0, '127.0.0.1');
    await new Promise(resolve => server.listening ? resolve() : server.once('listening', resolve));
    baseURL = `http://127.0.0.1:${server.address().port}/api`;
    adminToken = await login('admin-qa');
  });
  after(async () => {
    if (server) await new Promise(resolve => server.close(resolve));
    if (db) await db.close();
    if (adminConnection) {
      try {
        if (ownsSchema && testDatabase !== originalDatabase && /^mini_clinic_test_\d+_[a-f0-9]{8}$/.test(testDatabase)) {
          await adminConnection.query(`DROP DATABASE \`${testDatabase}\``);
          console.log('Disposable MySQL schema removed; configured clinic data untouched.');
        }
      } finally { await adminConnection.end(); }
    }
  });

  test('migrations establish unique indexes and can be rechecked against existing tables', async () => {
    const q = db.getQueryInterface();
    for (const [table, name] of [['registrations', 'registrations_visit_queue_unique'], ['examinations', 'examinations_registration_unique']]) {
      assert.ok((await q.showIndex(table)).some(index => index.name === name && index.unique));
    }
    await require('../../migrations/20261102000000-create-clinic-tables').up(q, require('sequelize'));
  });
  test('administrator creates doctor/staff accounts and each can sign in', async () => {
    for (const [username, role] of [['doctor-qa', 'Dokter'], ['staff-qa', 'Petugas Pendaftaran']]) {
      expectStatus(await request('/auth/register', { method: 'POST', body: { name: username, username, role, email: `${username}@example.test`, password } }), 201);
    }
    doctorToken = await login('doctor-qa'); staffToken = await login('staff-qa');
    assert.equal(expectStatus(await request('/auth/profile', { token: doctorToken }), 200).role, 'Dokter');
    doctor = expectStatus(await request('/doctors', { method: 'POST', body: { doctor_name: 'Dokter QA', specialization: 'Umum' } }), 201);
    clinic = expectStatus(await request('/clinics', { method: 'POST', body: { clinic_name: 'Poli QA' } }), 201);
  });
  test('eight simultaneous patient registrations receive unique medical record numbers', async () => {
    const results = await Promise.all(Array.from({ length: 8 }, (_, i) => request('/patients', { method: 'POST', token: staffToken, body: { name: `Pasien QA ${i}`, nik: `990000000000000${i}`, gender: 'Perempuan', birth_date: '1990-01-01', phone: '08000000000', address: 'Alamat pengujian' } })));
    patients = results.map(result => expectStatus(result, 201));
    assert.equal(new Set(patients.map(patient => patient.medical_record_number)).size, 8);
    assert.equal(await models.Patient.count(), 8);
  });
  test('eight simultaneous visits get unique queues for the clinic day', async () => {
    const { clinicDate } = require('../../helpers/clinicDate');
    const results = await Promise.all(patients.map(patient => request('/registrations', { method: 'POST', token: staffToken, body: { patient_id: patient.id, doctor_id: doctor.id, clinic_id: clinic.id, visit_date: clinicDate(), payment_type: 'UMUM', initial_complaint: 'Pengujian' } })));
    visits = results.map(result => expectStatus(result, 201));
    assert.equal(new Set(visits.map(visit => visit.queue_number)).size, 8);
    assert.equal(await models.Registration.count(), 8);
  });
  test('two staff calling simultaneously claim different visits', async () => {
    called = (await Promise.all([request('/queues/next', { method: 'POST', token: staffToken }), request('/queues/next', { method: 'POST', token: staffToken })])).map(result => expectStatus(result, 200));
    assert.equal(new Set(called.map(visit => visit.id)).size, 2);
    assert.ok(called.every(visit => visit.status === 'Check In'));
  });
  test('doctor saves SOAP and replaces recipes/actions when saving again', async () => {
    const payload = examPayload(called[0].id);
    const initial = expectStatus(await request('/examinations', { method: 'POST', token: doctorToken, body: payload }), 201);
    const updated = expectStatus(await request(`/examinations/${initial.id}`, { method: 'PUT', token: doctorToken, body: { ...payload, prescriptions: [{ ...payload.prescriptions[0], dosage: 'Dosis diperbarui' }] } }), 200);
    assert.equal(updated.prescriptions.length, 1);
    assert.equal(updated.prescriptions[0].dosage, 'Dosis diperbarui');
    assert.equal(await models.MedicalAction.count({ where: { examination_id: initial.id } }), 1);
    assert.equal(await models.Prescription.count({ where: { examination_id: initial.id } }), 1);
    const visit = await models.Registration.findByPk(called[0].id);
    assert.equal(visit.status, 'Pemeriksaan');
    const history = expectStatus(await request(`/examinations/patient/${visit.patient_id}/history`, { token: doctorToken }), 200);
    assert.equal(history[0].id, initial.id);
  });
  test('a real SQL failure rolls back SOAP, actions, and visit status together', async () => {
    // Inject a database-side error after SOAP/action inserts have already occurred.
    await db.query("CREATE TRIGGER qa_reject_prescription BEFORE INSERT ON prescriptions FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'QA rollback check'");
    try {
      const result = await request('/examinations', { method: 'POST', token: doctorToken, body: examPayload(called[1].id) });
      assert.equal(result.status, 500);
      assert.equal(await models.Examination.count({ where: { registration_id: called[1].id } }), 0);
      assert.equal(await models.MedicalAction.count(), 1);
      assert.equal(await models.Prescription.count(), 1);
      assert.equal((await models.Registration.findByPk(called[1].id)).status, 'Check In');
    } finally { await db.query('DROP TRIGGER qa_reject_prescription'); }
  });
  test('failed edits restore the previous prescriptions and diagnosis', async () => {
    const exam = await models.Examination.findOne({ where: { registration_id: called[0].id } });
    await db.query("CREATE TRIGGER qa_reject_prescription BEFORE INSERT ON prescriptions FOR EACH ROW SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'QA edit rollback check'");
    try {
      const result = await request(`/examinations/${exam.id}`, { method: 'PUT', token: doctorToken, body: { ...examPayload(called[0].id), diagnosis: 'Must roll back' } });
      assert.equal(result.status, 500);
      await exam.reload(); assert.equal(exam.diagnosis, 'Diagnosis pengujian');
      assert.equal((await models.Prescription.findOne({ where: { examination_id: exam.id } })).dosage, 'Dosis diperbarui');
    } finally { await db.query('DROP TRIGGER qa_reject_prescription'); }
  });
  test('doctor completes examination; finished records reject edits and deletion', async () => {
    const exam = await models.Examination.findOne({ where: { registration_id: called[0].id } });
    expectStatus(await request(`/examinations/${exam.id}/complete`, { method: 'PUT', token: doctorToken }), 200);
    assert.equal((await models.Registration.findByPk(called[0].id)).status, 'Selesai');
    assert.equal((await request(`/examinations/${exam.id}`, { method: 'PUT', token: doctorToken, body: examPayload(called[0].id) })).status, 409);
    assert.equal((await request(`/patients/${called[0].patient_id}`, { method: 'DELETE' })).status, 409);
    const stats = expectStatus(await request('/dashboard/stats'), 200);
    assert.equal(stats.totalPatients, 8); assert.equal(stats.completedPatients, 1);
  });
});
