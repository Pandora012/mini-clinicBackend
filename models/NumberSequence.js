const sequelize = require('../config/sequelize');
const { DataTypes } = require('sequelize');
module.exports = sequelize.define('NumberSequence', {
  name: { type: DataTypes.STRING(64), primaryKey: true },
  last_value: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
}, { tableName: 'number_sequences', timestamps: false });
