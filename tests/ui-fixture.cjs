// Local, disposable UI fixtures. No real accounts, database, or persisted clinical data.
const express = require('express');
const app = express();
app.use(require('cors')({ origin: ['http://127.0.0.1:5174', 'http://localhost:5174'] }));
app.use(express.json());
const user = { id: 1, name: 'Tim Demo', username: 'demo', role: 'Administrator' };
const patient = { id: 1, name: 'Pasien Contoh', medical_record_number: 'RM000001', nik: '0000000000000000', gender: 'Perempuan', birth_date: '1995-01-01', phone: '0000000000', address: 'Alamat contoh untuk pengujian antarmuka' };
const visits = process.env.UI_FIXTURE_EMPTY === '1' ? [] : [
  { id: 1, patient_id: 1, clinic_id: 1, patient, doctor: { doctor_name: 'Dokter Contoh' }, clinic: { clinic_name: 'Poli Umum' }, queue_number: 'A001', status: 'Pemeriksaan', payment_type: 'UMUM', visit_date: '2026-11-03' },
  { id: 2, patient_id: 1, clinic_id: 2, patient: { ...patient, name: 'Pasien Demo' }, doctor: { doctor_name: 'Dokter Contoh' }, clinic: { clinic_name: 'Poli Gigi' }, queue_number: 'A002', status: 'Menunggu', payment_type: 'BPJS', visit_date: '2026-11-03' },
  { id: 3, patient_id: 1, clinic_id: 1, patient: { ...patient, name: 'Pasien Uji' }, doctor: { doctor_name: 'Dokter Contoh' }, clinic: { clinic_name: 'Poli Umum' }, queue_number: 'A003', status: 'Check In', payment_type: 'UMUM', visit_date: '2026-11-03' },
  { id: 4, patient_id: 1, clinic_id: 2, patient: { ...patient, name: 'Pasien Selesai' }, doctor: { doctor_name: 'Dokter Contoh' }, clinic: { clinic_name: 'Poli Gigi' }, queue_number: 'A004', status: 'Selesai', payment_type: 'BPJS', visit_date: '2026-11-03' },
];
let exam = null;
const doctors = [
  { id: 1, doctor_name: 'Aruna Contoh', specialization: 'Penyakit Dalam' },
  { id: 2, doctor_name: 'Bima Demo', specialization: 'Gigi' },
  { id: 3, doctor_name: 'Citra Uji', specialization: 'Umum' },
];
let nextDoctorId = 4;
const ok = (res, data, extra = {}) => res.json({ success: true, data, ...extra });
app.get('/api/doctors', (req, res) => ok(res, doctors));
app.post('/api/doctors', (req, res) => {
  const doctor = { ...req.body, id: nextDoctorId++ };
  doctors.push(doctor);
  ok(res, doctor);
});
app.put('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === Number(req.params.id));
  if (!doctor) return res.sendStatus(404);
  ok(res, Object.assign(doctor, req.body));
});
app.delete('/api/doctors/:id', (req, res) => {
  const index = doctors.findIndex(d => d.id === Number(req.params.id));
  if (index < 0) return res.sendStatus(404);
  doctors.splice(index, 1);
  ok(res, null);
});
app.post('/api/auth/login', (req, res) => ok(res, { token: 'local-ui-fixture', user }, { message: 'Masuk ke data contoh.' }));
app.get('/api/auth/profile', (req, res) => ok(res, user));
app.get('/api/dashboard/stats', (req, res) => ok(res, { totalPatients: 125, patientsToday: 12, totalQueuesToday: 12, waitingPatients: 4, completedPatients: 8, totalDoctors: 3, totalClinics: 2 }));
app.get('/api/queues/today', (req, res) => ok(res, visits, { stats: { waiting: visits.filter(row => row.status === 'Menunggu').length, inProgress: visits.filter(row => row.status === 'Pemeriksaan').length, completed: visits.filter(row => row.status === 'Selesai').length } }));
app.post('/api/queues/next', (req, res) => {
  const visit = visits.find(row => row.status === 'Menunggu');
  if (visit) visit.status = 'Check In';
  ok(res, visit || null);
});
app.put('/api/queues/:id/status', (req, res) => {
  const visit = visits.find(row => String(row.id) === req.params.id);
  if (!visit) return res.status(404).json({ success: false, message: 'Antrean fixture tidak ditemukan.' });
  visit.status = req.body.status;
  ok(res, visit);
});
app.get('/api/queues/history', (req, res) => ok(res, visits));
app.get('/api/patients', (req, res) => ok(res, [patient], { pagination: { page: 1, total: 1, limit: 10, totalPages: 1 } }));
app.get('/api/patients/:id', (req, res) => ok(res, patient));
app.get('/api/registrations/:id', (req, res) => ok(res, visits[0]));
app.get('/api/examinations/patient/:id/history', (req, res) => ok(res, exam ? [exam] : []));
app.get('/api/examinations/registration/:id', (req, res) => ok(res, exam));
app.post('/api/examinations', (req, res) => { exam = { ...req.body, id: 1, registration_id: 1 }; ok(res, exam); });
app.put('/api/examinations/:id', (req, res) => { exam = { ...req.body, id: 1, registration_id: 1 }; ok(res, exam); });
app.listen(5011, '127.0.0.1', () => console.log('UI fixtures only: http://127.0.0.1:5011/api'));
