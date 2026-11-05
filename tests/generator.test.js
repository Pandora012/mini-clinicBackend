const { test, afterEach, mock } = require('node:test');
const assert = require('node:assert/strict');
const sequelize = require('../config/sequelize');
const Sequence = require('../models/NumberSequence');
const { generateQueueNumber, generateMedicalRecordNumber } = require('../helpers/generator');
afterEach(() => mock.restoreAll());
test('number allocation requires the insert transaction', async () => {
  await assert.rejects(() => generateMedicalRecordNumber(), /requires a transaction/);
});
test('sequence locks and advances beyond existing records, including four digit queues', async () => {
  const transaction = { LOCK: { UPDATE: 'UPDATE' } };
  const sequence = { last_value: 500, update: mock.fn(async (data, options) => { assert.equal(options.transaction, transaction); sequence.last_value = data.last_value; }) };
  mock.method(Sequence, 'findByPk', async (key, options) => { assert.equal(key, 'queue:2026-11-03'); assert.equal(options.lock, 'UPDATE'); assert.equal(options.transaction, transaction); return sequence; });
  mock.method(sequelize, 'query', async (sql, options) => { assert.equal(options.transaction, transaction); return sql.startsWith('SELECT') ? [{ maximum: 1000 }] : []; });
  assert.equal(await generateQueueNumber('2026-11-03', transaction), 'A1001');
  assert.equal(await generateQueueNumber('2026-11-03', transaction), 'A1002');
});
