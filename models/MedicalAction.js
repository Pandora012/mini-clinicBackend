const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');

const MedicalAction = sequelize.define('MedicalAction', {
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
  action_name: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'medical_actions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = MedicalAction;