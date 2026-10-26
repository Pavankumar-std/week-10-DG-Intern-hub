// All routes in one file so beginners can see the whole API at a glance.
const express = require('express');
const { protect, allowRoles } = require('../middleware/auth');
const auth = require('../controllers/authController');
const jobs = require('../controllers/jobController');
const apps = require('../controllers/applicationController');
const users = require('../controllers/userController');
const notifs = require('../controllers/notificationController');
const stats = require('../controllers/statsController');

const router = express.Router();

// ---- Auth ----
router.post('/auth/register', auth.register);
router.post('/auth/login', auth.login);
router.get('/auth/me', protect, auth.me);

// ---- Jobs ---- (order matters: fixed paths BEFORE "/:id")
router.get('/jobs', jobs.getJobs);
router.get('/jobs/recommended', protect, allowRoles('candidate'), jobs.getRecommended);
router.get('/jobs/mine', protect, allowRoles('recruiter'), jobs.getMyJobs);
router.get('/jobs/:id', jobs.getJob);
router.post('/jobs', protect, allowRoles('recruiter'), jobs.createJob);
router.put('/jobs/:id', protect, allowRoles('recruiter'), jobs.updateJob);
router.delete('/jobs/:id', protect, allowRoles('recruiter', 'admin'), jobs.deleteJob);

// ---- Applications ----
router.post('/applications', protect, allowRoles('candidate'), apps.apply);
router.get('/applications/mine', protect, allowRoles('candidate'), apps.myApplications);
router.get('/applications/job/:jobId', protect, allowRoles('recruiter'), apps.jobApplications);
router.put('/applications/:id/status', protect, allowRoles('recruiter'), apps.updateStatus);

// ---- Users ----
router.get('/users/profile', protect, users.getProfile);
router.put('/users/profile', protect, users.updateProfile);
router.get('/users/saved', protect, allowRoles('candidate'), users.getSaved);
router.post('/users/saved/:jobId', protect, allowRoles('candidate'), users.toggleSaved);
router.get('/users', protect, allowRoles('admin'), users.listUsers);
router.put('/users/:id/disable', protect, allowRoles('admin'), users.toggleDisable);

// ---- Notifications ----
router.get('/notifications', protect, notifs.list);
router.put('/notifications/read-all', protect, notifs.markAllRead);
router.put('/notifications/:id/read', protect, notifs.markRead);

// ---- Stats ----
router.get('/stats', protect, stats.getStats);

module.exports = router;
