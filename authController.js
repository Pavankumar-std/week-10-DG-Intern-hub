const bcrypt = require('bcryptjs');
const { data, save, nextId } = require('../db');
const { signToken } = require('../middleware/auth');
const { safeUser, notify } = require('./helpers');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/auth/register
exports.register = (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });
  if (!emailRegex.test(email || '')) return res.status(400).json({ message: 'Enter a valid email address.' });
  if (!password || password.length < 8) return res.status(400).json({ message: 'Password must contain at least 8 characters.' });
  if (!/^[0-9]{10}$/.test(phone || '')) return res.status(400).json({ message: 'Phone must be 10 digits.' });
  if (!['candidate', 'recruiter'].includes(role)) return res.status(400).json({ message: 'Role must be candidate or recruiter.' });

  if (data.users.find((u) => u.email === email.toLowerCase())) {
    return res.status(400).json({ message: 'This email is already registered.' });
  }

  const user = {
    id: nextId(), name: name.trim(), email: email.toLowerCase(), phone, role,
    password: bcrypt.hashSync(password, 10),
    skills: [], bio: '', savedJobs: [], disabled: false, createdAt: new Date().toISOString(),
  };
  data.users.push(user);
  save();
  notify(user.id, 'Welcome! Your account was created successfully.', 'success');

  res.status(201).json({ token: signToken(user), user: safeUser(user) });
};

// POST /api/auth/login
exports.login = (req, res) => {
  const { email, password } = req.body;
  const user = data.users.find((u) => u.email === (email || '').toLowerCase());

  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }
  if (user.disabled) return res.status(403).json({ message: 'Your account has been disabled.' });

  res.json({ token: signToken(user), user: safeUser(user) });
};

// GET /api/auth/me
exports.me = (req, res) => res.json({ user: safeUser(req.user) });
