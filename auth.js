// Middleware = a function that runs BEFORE your route code.
const jwt = require('jsonwebtoken');
const { data } = require('../db');

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

// 1) protect: user must send "Authorization: Bearer <token>"
function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Please login first.' });

  try {
    const decoded = jwt.verify(token, SECRET);
    const user = data.users.find((u) => u.id === decoded.id);
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    if (user.disabled) return res.status(403).json({ message: 'Your account has been disabled.' });
    req.user = user; // now every route can use req.user
    next();
  } catch (err) {
    res.status(401).json({ message: 'Session expired. Please login again.' });
  }
}

// 2) allowRoles('admin') -> only these roles may continue
const allowRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You are not allowed to do this.' });
  }
  next();
};

const signToken = (user) => jwt.sign({ id: user.id }, SECRET, { expiresIn: '7d' });

module.exports = { protect, allowRoles, signToken };
