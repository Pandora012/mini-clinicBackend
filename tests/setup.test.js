const { test } = require('node:test');
const assert = require('node:assert/strict');
const S = require('sequelize');
const baseline = require('../migrations/20261102000000-create-clinic-tables');
const counters = require('../migrations/20261103000000-create-number-sequences');
const users = require('../migrations/20260730134802-create-users-table');
test('baseline preserves an existing SQL import and does not recreate tables', async () => {
  const created = [];
  const q = { showAllTables: async () => ['users', 'patients', 'doctors', 'clinics', 'registrations', 'examinations', 'medical_actions', 'prescriptions', 'number_sequences'], createTable: async name => created.push(name) };
  await users.up(q, S); await baseline.up(q, S); await counters.up(q, S);
  assert.deepEqual(created, []);
});
test('fresh baseline creates referenced tables before their dependants', async () => {
  const created = [];
  const q = { showAllTables: async () => [], createTable: async (name, columns) => {
    for (const field of Object.values(columns)) if (field.references) assert.ok(created.includes(field.references.model));
    created.push(name);
  } };
  await baseline.up(q, S); await counters.up(q, S);
  assert.equal(created.length, 8);
});
test('login limiter expires and allows retry after the window', () => {
  let time = 0; let passed = 0;
  const middleware = require('../middleware/loginLimit')({ max: 2, windowMs: 1000, now: () => time });
  const res = { statusCode: 200, on() {}, set() {}, status(code) { this.statusCode = code; return this; }, json() {} };
  for (let i = 0; i < 3; i++) middleware({ ip: 'test' }, res, () => passed++);
  assert.equal(passed, 2); assert.equal(res.statusCode, 429);
  time = 1001; middleware({ ip: 'test' }, res, () => passed++);
  assert.equal(passed, 3);
});
