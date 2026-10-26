const { data, save } = require('../db');
const { safeUser, toArray, notify } = require('./helpers');

// GET /api/users/profile
exports.getProfile = (req, res) => res.json({ user: safeUser(req.user) });

// PUT /api/users/profile
exports.updateProfile = (req, res) => {
  const { name, phone, bio, skills } = req.body;
  if (name !== undefined && name.trim().length < 2) return res.status(400).json({ message: 'Name must be at least 2 characters.' });
  if (phone !== undefined && !/^[0-9]{10}$/.test(phone)) return res.status(400).json({ message: 'Phone must be 10 digits.' });

  const u = req.user;
  if (name !== undefined) u.name = name.trim();
  if (phone !== undefined) u.phone = phone;
  if (bio !== undefined) u.bio = bio;
  if (skills !== undefined) u.skills = toArray(skills);
  save();
  res.json({ user: safeUser(u) });
};

// GET /api/users/saved  -> full saved job objects
exports.getSaved = (req, res) => {
  const jobs = data.jobs.filter((j) => req.user.savedJobs.includes(j.id));
  res.json({ jobs, ids: req.user.savedJobs });
};

// POST /api/users/saved/:jobId  -> toggle save/unsave
exports.toggleSaved = (req, res) => {
  const id = req.params.jobId;
  const u = req.user;
  u.savedJobs = u.savedJobs.includes(id) ? u.savedJobs.filter((x) => x !== id) : [...u.savedJobs, id];
  save();
  res.json({ ids: u.savedJobs, saved: u.savedJobs.includes(id) });
};

// ----- Admin only -----
// GET /api/users?role=
exports.listUsers = (req, res) => {
  const { role } = req.query;
  const users = data.users.filter((u) => !role || u.role === role).map(safeUser);
  res.json({ users });
};

// PUT /api/users/:id/disable   -> toggle disabled
exports.toggleDisable = (req, res) => {
  const user = data.users.find((u) => u.id === req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found.' });
  if (user.role === 'admin') return res.status(400).json({ message: 'You cannot disable an admin.' });
  user.disabled = !user.disabled;
  save();
  res.json({ user: safeUser(user) });
};
