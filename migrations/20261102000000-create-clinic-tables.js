'use strict';
// Existing SQL imports are preserved; new installations can use migrations only.
module.exports = {
  async up(q, S) {
    const tables = new Set(await q.showAllTables());
    const id = () => ({ type: S.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false });
    const text = (size, extra = {}) => ({ type: S.STRING(size), allowNull: false, ...extra });
    const ref = table => ({ type: S.INTEGER, allowNull: false, references: { model: table, key: 'id' }, onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
    const timestamps = () => ({ created_at: { type: S.DATE, allowNull: false }, updated_at: { type: S.DATE, allowNull: false } });
    const create = async (name, columns) => { if (!tables.has(name)) await q.createTable(name, { id: id(), ...columns, ...timestamps() }); };
    await create('patients', { medical_record_number: text(10, { unique: true }), nik: text(16, { unique: true }), name: text(100), gender: { type: S.ENUM('Laki-laki', 'Perempuan'), allowNull: false }, birth_date: { type: S.DATEONLY, allowNull: false }, phone: text(20), address: { type: S.TEXT, allowNull: false } });
    await create('doctors', { doctor_name: text(100), specialization: text(100) });
    await create('clinics', { clinic_name: text(100) });
    await create('registrations', { patient_id: ref('patients'), doctor_id: ref('doctors'), clinic_id: ref('clinics'), visit_date: { type: S.DATEONLY, allowNull: false }, payment_type: { type: S.ENUM('BPJS', 'UMUM', 'Asuransi'), allowNull: false }, initial_complaint: { type: S.TEXT, allowNull: true }, queue_number: text(10), status: { type: S.ENUM('Menunggu', 'Check In', 'Pemeriksaan', 'Selesai'), allowNull: false, defaultValue: 'Menunggu' } });
    await create('examinations', { registration_id: ref('registrations'), complaint: { type: S.TEXT }, blood_pressure: { type: S.STRING(20) }, body_temperature: { type: S.STRING(10) }, body_weight: { type: S.DECIMAL(5, 2) }, body_height: { type: S.DECIMAL(5, 2) }, diagnosis: { type: S.TEXT }, therapy_plan: { type: S.TEXT } });
    await create('medical_actions', { examination_id: ref('examinations'), action_name: text(200), notes: { type: S.TEXT } });
    await create('prescriptions', { examination_id: ref('examinations'), medicine_name: text(200), dosage: text(100), instruction: { type: S.TEXT, allowNull: false } });
  },
  // This baseline also supports pre-existing imports. Never drop their clinical data on undo.
  async down() { throw new Error('Baseline klinik tidak dihapus otomatis. Pulihkan backup jika perlu membatalkan instalasi.'); },
};
