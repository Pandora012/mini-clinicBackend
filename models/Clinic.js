const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const Clinic = sequelize.define('Clinic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clinic_name: {
    type: DataTypes.STRING(100),
    allowNull: false
  }
}, {
  tableName: 'clinics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Clinic;