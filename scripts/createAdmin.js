const bcrypt = require('bcryptjs');
const sequelize = require('../config/sequelize');
const { User } = require('../models');
// Deliberately no default credentials, no HTTP bootstrap route, and no overwrite.
const main = async () => {
  const { ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_NAME = 'Administrator' } = process.env;
  if (!ADMIN_USERNAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) throw new Error('Isi ADMIN_USERNAME, ADMIN_EMAIL, dan ADMIN_PASSWORD minimal 12 karakter melalui environment.');
  await sequelize.authenticate();
  if (await User.findOne({ where: { username: ADMIN_USERNAME } })) throw new Error('Username sudah tersedia; akun tidak diubah.');
  await User.create({ name: ADMIN_NAME, username: ADMIN_USERNAME, email: ADMIN_EMAIL, password: await bcrypt.hash(ADMIN_PASSWORD, 12), role: 'Administrator' });
  console.log('Akun administrator berhasil dibuat.');
};
main().catch(error => { console.error(error.message); process.exitCode = 1; }).finally(() => sequelize.close());
