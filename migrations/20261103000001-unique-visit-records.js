'use strict';
module.exports = {
  async up(q) {
    for (const [table, name, fields] of [
      ['registrations', 'registrations_visit_queue_unique', ['visit_date', 'queue_number']],
      ['examinations', 'examinations_registration_unique', ['registration_id']],
    ]) {
      const existing = await q.showIndex(table);
      if (!existing.some(index => index.name === name)) await q.addIndex(table, fields, { unique: true, name });
    }
  },
  async down(q) {
    await q.removeIndex('examinations', 'examinations_registration_unique');
    await q.removeIndex('registrations', 'registrations_visit_queue_unique');
  },
};
