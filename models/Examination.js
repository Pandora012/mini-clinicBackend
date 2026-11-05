const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const Examination = sequelize.define('Examination', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  registration_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'registrations',
      key: 'id'
    }
  },
  complaint: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  blood_pressure: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  body_temperature: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  body_weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  body_height: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  therapy_plan: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'examinations',
  indexes: [{ name: 'examinations_registration_unique', unique: true, fields: ['registration_id'] }],
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Examination;
