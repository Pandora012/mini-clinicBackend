const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Clinic = require('./Clinic');
const Registration = require('./Registration');
const Examination = require('./Examination');
const MedicalAction = require('./MedicalAction');
const Prescription = require('./Prescription');
require('./NumberSequence');

Patient.hasMany(Registration, { foreignKey: 'patient_id', as: 'registrations' });
Registration.belongsTo(Patient, { foreignKey: 'patient_id', as: 'patient' });

Doctor.hasMany(Registration, { foreignKey: 'doctor_id', as: 'registrations' });
Registration.belongsTo(Doctor, { foreignKey: 'doctor_id', as: 'doctor' });

Clinic.hasMany(Registration, { foreignKey: 'clinic_id', as: 'registrations' });
Registration.belongsTo(Clinic, { foreignKey: 'clinic_id', as: 'clinic' });

Registration.hasOne(Examination, { foreignKey: 'registration_id', as: 'examination' });
Examination.belongsTo(Registration, { foreignKey: 'registration_id', as: 'registration' });

Examination.hasMany(MedicalAction, { foreignKey: 'examination_id', as: 'medical_actions' });
MedicalAction.belongsTo(Examination, { foreignKey: 'examination_id', as: 'examination' });

Examination.hasMany(Prescription, { foreignKey: 'examination_id', as: 'prescriptions' });
Prescription.belongsTo(Examination, { foreignKey: 'examination_id', as: 'examination' });

module.exports = {
  User,
  Patient,
  Doctor,
  Clinic,
  Registration,
  Examination,
  MedicalAction,
  Prescription
};
