const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const Registration = sequelize.define('Registration', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patient_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  clinic_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'clinics',
      key: 'id'
    }
  },
  visit_date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  payment_type: {
    type: DataTypes.ENUM('BPJS', 'UMUM', 'Asuransi'),
    allowNull: false
  },
  initial_complaint: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  queue_number: {
    type: DataTypes.STRING(10),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Menunggu', 'Check In', 'Pemeriksaan', 'Selesai'),
    allowNull: false,
    defaultValue: 'Menunggu'
  }
}, {
  tableName: 'registrations',
  indexes: [{ name: 'registrations_visit_queue_unique', unique: true, fields: ['visit_date', 'queue_number'] }],
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Registration;
