const { data, save, nextId } = require('../db');
const { notify, safeUser } = require('./helpers');

const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

// POST /api/applications   (candidate)
exports.apply = (req, res) => {
  const { jobId, resume, coverLetter, skills, education, experience } = req.body;
  const job = data.jobs.find((j) => j.id === jobId);
  if (!job) return res.status(404).json({ message: 'Job not found.' });

  if (!resume) return res.status(400).json({ message: 'Resume is required.' });
  if (!coverLetter || coverLetter.trim().length < 30) return res.status(400).json({ message: 'Cover letter must be at least 30 characters.' });
  if (!skills) return res.status(400).json({ message: 'Skills are required.' });
  if (!education) return res.status(400).json({ message: 'Education is required.' });
  if (!experience) return res.status(400).json({ message: 'Experience is required.' });

  if (data.applications.find((a) => a.jobId === jobId && a.candidateId === req.user.id)) {
    return res.status(400).json({ message: 'You have already applied for this job.' });
  }

  const application = {
    id: nextId(), jobId, candidateId: req.user.id, resume, coverLetter, skills, education, experience,
    status: 'Applied', createdAt: new Date().toISOString(),
  };
  data.applications.push(application);
  save();
  notify(job.recruiterId, `${req.user.name} applied for "${job.title}".`, 'info');
  notify(req.user.id, `Your application for "${job.title}" was submitted.`, 'success');

  res.status(201).json({ application });
};

// GET /api/applications/mine   (candidate)
exports.myApplications = (req, res) => {
  const applications = data.applications
    .filter((a) => a.candidateId === req.user.id)
    .map((a) => ({ ...a, job: data.jobs.find((j) => j.id === a.jobId) || null }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ applications });
};

// GET /api/applications/job/:jobId?q=   (recruiter who owns the job)
exports.jobApplications = (req, res) => {
  const job = data.jobs.find((j) => j.id === req.params.jobId);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (job.recruiterId !== req.user.id) return res.status(403).json({ message: 'This is not your job.' });

  const q = (req.query.q || '').toLowerCase();
  const applications = data.applications
    .filter((a) => a.jobId === job.id)
    .map((a) => {
      const c = data.users.find((u) => u.id === a.candidateId);
      return { ...a, candidate: c ? safeUser(c) : null };
    })
    .filter((a) => !q || (a.candidate && (a.candidate.name.toLowerCase().includes(q) || a.skills.toLowerCase().includes(q))))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ applications, job });
};

// PUT /api/applications/:id/status   (recruiter who owns the job)
exports.updateStatus = (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status.' });

  const application = data.applications.find((a) => a.id === req.params.id);
  if (!application) return res.status(404).json({ message: 'Application not found.' });
  const job = data.jobs.find((j) => j.id === application.jobId);
  if (!job || job.recruiterId !== req.user.id) return res.status(403).json({ message: 'This is not your job.' });

  application.status = status;
  save();
  notify(application.candidateId, `Your application for "${job.title}" is now: ${status}.`, status === 'Rejected' ? 'warning' : 'success');
  res.json({ application });
};
