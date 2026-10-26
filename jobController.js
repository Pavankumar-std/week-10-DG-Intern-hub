const { data, save, nextId } = require('../db');
const { toArray, notify } = require('./helpers');

// Check required fields for a job
function validateJob(b) {
  if (!b.title || b.title.trim().length < 3) return 'Job title must be at least 3 characters.';
  if (!b.company) return 'Company is required.';
  if (!b.location) return 'Location is required.';
  if (!b.description || b.description.trim().length < 20) return 'Description must be at least 20 characters.';
  if (isNaN(Number(b.salary)) || Number(b.salary) < 0) return 'Salary must be a number.';
  return null;
}

// GET /api/jobs?q=&location=&experience=&type=&minSalary=&workMode=&company=&skills=&sort=&page=&limit=
// Filtering + sorting + pagination all happen on the SERVER.
exports.getJobs = (req, res) => {
  const { q, location, experience, type, minSalary, workMode, company, skills, sort = 'newest' } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.max(parseInt(req.query.limit) || 6, 1);
  const has = (text, word) => String(text).toLowerCase().includes(String(word).toLowerCase());

  let list = data.jobs.filter((j) => j.status === 'active');

  if (q) list = list.filter((j) => has(j.title, q) || has(j.company, q) || j.skills.some((s) => has(s, q)));
  if (location) list = list.filter((j) => has(j.location, location));
  if (company) list = list.filter((j) => has(j.company, company));
  if (type) list = list.filter((j) => j.type === type);
  if (workMode) list = list.filter((j) => j.workMode === workMode);
  if (experience !== undefined && experience !== '') list = list.filter((j) => j.experience <= Number(experience));
  if (minSalary) list = list.filter((j) => j.salary >= Number(minSalary));
  if (skills) {
    const wanted = toArray(skills);
    list = list.filter((j) => wanted.some((w) => j.skills.some((s) => has(s, w))));
  }

  // Sorting
  const relevance = (j) => (q ? (has(j.title, q) ? 3 : 0) + (j.skills.some((s) => has(s, q)) ? 2 : 0) + (has(j.company, q) ? 1 : 0) : 0);
  const sorters = {
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    oldest: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    salaryLow: (a, b) => a.salary - b.salary,
    salaryHigh: (a, b) => b.salary - a.salary,
    relevant: (a, b) => relevance(b) - relevance(a),
  };
  list.sort(sorters[sort] || sorters.newest);

  // Pagination
  const total = list.length;
  const pages = Math.max(Math.ceil(total / limit), 1);
  const jobs = list.slice((page - 1) * limit, page * limit);

  res.json({ jobs, total, page, pages });
};

// GET /api/jobs/recommended  (candidate) - "match score" = % of job skills the user has
exports.getRecommended = (req, res) => {
  const mySkills = (req.user.skills || []).map((s) => s.toLowerCase());
  const result = data.jobs
    .filter((j) => j.status === 'active')
    .map((j) => {
      const matched = j.skills.filter((s) => mySkills.includes(s.toLowerCase()));
      const score = j.skills.length ? Math.round((matched.length / j.skills.length) * 100) : 0;
      return { ...j, matchScore: score, matchedSkills: matched };
    })
    .filter((j) => j.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 6);
  res.json({ jobs: result });
};

// GET /api/jobs/mine  (recruiter) - jobs I posted + applicant count
exports.getMyJobs = (req, res) => {
  const jobs = data.jobs
    .filter((j) => j.recruiterId === req.user.id)
    .map((j) => ({ ...j, applicants: data.applications.filter((a) => a.jobId === j.id).length }))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ jobs });
};

// GET /api/jobs/:id
exports.getJob = (req, res) => {
  const job = data.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  res.json({ job });
};

// POST /api/jobs
exports.createJob = (req, res) => {
  const error = validateJob(req.body);
  if (error) return res.status(400).json({ message: error });
  const b = req.body;

  const job = {
    id: nextId(), title: b.title.trim(), company: b.company.trim(), location: b.location.trim(),
    type: b.type || 'Full-time', workMode: b.workMode || 'On-site',
    experience: Number(b.experience) || 0, salary: Number(b.salary), skills: toArray(b.skills),
    description: b.description.trim(), recruiterId: req.user.id, status: 'active',
    createdAt: new Date().toISOString(),
  };
  data.jobs.push(job);
  save();
  res.status(201).json({ job });
};

// PUT /api/jobs/:id
exports.updateJob = (req, res) => {
  const job = data.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (job.recruiterId !== req.user.id) return res.status(403).json({ message: 'You can only edit your own jobs.' });

  const error = validateJob({ ...job, ...req.body });
  if (error) return res.status(400).json({ message: error });

  const b = req.body;
  Object.assign(job, {
    title: b.title ?? job.title, company: b.company ?? job.company, location: b.location ?? job.location,
    type: b.type ?? job.type, workMode: b.workMode ?? job.workMode,
    experience: b.experience !== undefined ? Number(b.experience) : job.experience,
    salary: b.salary !== undefined ? Number(b.salary) : job.salary,
    skills: b.skills !== undefined ? toArray(b.skills) : job.skills,
    description: b.description ?? job.description,
  });
  save();
  res.json({ job });
};

// DELETE /api/jobs/:id   (owner recruiter OR admin)
exports.deleteJob = (req, res) => {
  const job = data.jobs.find((j) => j.id === req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found.' });
  if (req.user.role !== 'admin' && job.recruiterId !== req.user.id) {
    return res.status(403).json({ message: 'You can only delete your own jobs.' });
  }
  data.jobs = data.jobs.filter((j) => j.id !== job.id);
  data.applications = data.applications.filter((a) => a.jobId !== job.id);
  if (req.user.role === 'admin') notify(job.recruiterId, `Your job "${job.title}" was removed by an admin.`, 'warning');
  save();
  res.json({ message: 'Job deleted.' });
};
