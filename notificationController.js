const { data, save } = require('../db');

// GET /api/notifications
exports.list = (req, res) => {
  const notifications = data.notifications
    .filter((n) => n.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ notifications });
};

// PUT /api/notifications/:id/read
exports.markRead = (req, res) => {
  const n = data.notifications.find((x) => x.id === req.params.id && x.userId === req.user.id);
  if (n) n.read = true;
  save();
  res.json({ ok: true });
};

// PUT /api/notifications/read-all
exports.markAllRead = (req, res) => {
  data.notifications.filter((n) => n.userId === req.user.id).forEach((n) => (n.read = true));
  save();
  res.json({ ok: true });
};
