const loginLimit = ({ max = 20, windowMs = 15 * 60 * 1000, now = Date.now } = {}) => {
  const attempts = new Map();
  return (req, res, next) => {
    const time = now();
    for (const [key, value] of attempts) if (value.expires <= time) attempts.delete(key);
    const key = req.ip;
    const entry = attempts.get(key) || { count: 0, expires: time + windowMs };
    if (entry.count >= max) {
      res.set('Retry-After', String(Math.ceil((entry.expires - time) / 1000)));
      return res.status(429).json({ success: false, message: 'Terlalu banyak percobaan masuk. Coba lagi beberapa saat.' });
    }
    entry.count++; attempts.set(key, entry);
    res.on('finish', () => { if (res.statusCode < 400) attempts.delete(key); });
    next();
  };
};
module.exports = loginLimit;
