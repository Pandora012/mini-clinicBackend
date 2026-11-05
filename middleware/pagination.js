module.exports = (req, res, next) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 10);
  if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    return res.status(400).json({ success: false, message: 'Halaman harus positif dan jumlah data antara 1–100.' });
  }
  req.query.page = page;
  req.query.limit = limit;
  next();
};
