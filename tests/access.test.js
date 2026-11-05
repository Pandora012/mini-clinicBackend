const { test, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.JWT_SECRET = 'test-only-secret';
const { User } = require('../models');
// Account creation must never reach persistence without administrator authorization.
let writes = 0;
User.create = async (data) => { writes++; return { ...data, id: 1 }; };
const app = require('../app');
const server = app.listen(0, '127.0.0.1');
after(() => server.close());

test('anonymous visitors cannot create administrator accounts', async () => {
  await new Promise(resolve => server.listening ? resolve() : server.once('listening', resolve));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', username: 'testuser', email: 'test@example.com', password: 'secret123', role: 'Administrator' }),
  });
  assert.equal(response.status, 401);
  assert.equal(writes, 0);
});

test('registration staff cannot create accounts either', async () => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: 4, role: 'Petugas Pendaftaran' }, process.env.JWT_SECRET);
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Test', username: 'testuser', email: 'test@example.com', password: 'secret123', role: 'Administrator' }),
  });
  assert.equal(response.status, 403);
  assert.equal(writes, 0);
});

test('administrator can create accounts and response excludes password hashes', async () => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: 1, role: 'Administrator' }, process.env.JWT_SECRET);
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: 'Test', username: 'newuser', email: 'new@example.com', password: 'secret123', role: 'Dokter' }),
  });
  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.data.password, undefined);
  assert.equal(writes, 1);
});
test('doctor can reach examination validation while registration staff is denied', async () => {
  const jwt = require('jsonwebtoken');
  for (const [role, expected] of [['Dokter', 400], ['Petugas Pendaftaran', 403]]) {
    const token = jwt.sign({ id: 2, role }, process.env.JWT_SECRET);
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/examinations`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: '{}',
    });
    assert.equal(response.status, expected);
  }
});
test('pagination rejects unbounded or invalid page sizes before accessing database', async () => {
  const jwt = require('jsonwebtoken');
  const token = jwt.sign({ id: 1, role: 'Administrator' }, process.env.JWT_SECRET);
  for (const query of ['limit=100000', 'page=-1', 'limit=NaN']) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/patients?${query}`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(response.status, 400);
  }
});
