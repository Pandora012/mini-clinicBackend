'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    if ((await queryInterface.showAllTables()).includes('number_sequences')) return;
    await queryInterface.createTable('number_sequences', {
      name: { type: Sequelize.STRING(64), primaryKey: true, allowNull: false },
      last_value: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable('number_sequences'); },
};

