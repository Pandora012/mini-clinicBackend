const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const Prescription = sequelize.define('Prescription', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  examination_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'examinations',
      key: 'id'
    }
  },
  medicine_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  dosage: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  instruction: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'prescriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Prescription;