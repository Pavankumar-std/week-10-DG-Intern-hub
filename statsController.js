const { data } = require('../db');

const count = (arr, fn) => arr.filter(fn).length;

// GET /api/stats  -> numbers for the dashboard of the logged-in role
exports.getStats = (req, res) => {
  const u = req.user;

  if (u.role === 'candidate') {
    const mine = data.applications.filter((a) => a.candidateId === u.id);
    return res.json({
      applied: mine.length,
      shortlisted: count(mine, (a) => a.status === 'Shortlisted'),
      interviews: count(mine, (a) => a.status === 'Interview'),
      rejected: count(mine, (a) => a.status === 'Rejected'),
    });
  }

  if (u.role === 'recruiter') {
    const myJobs = data.jobs.filter((j) => j.recruiterId === u.id);
    const ids = myJobs.map((j) => j.id);
    const apps = data.applications.filter((a) => ids.includes(a.jobId));
    return res.json({
      activeJobs: myJobs.length,
      applications: apps.length,
      shortlisted: count(apps, (a) => a.status === 'Shortlisted'),
      interviews: count(apps, (a) => a.status === 'Interview'),
    });
  }

  // admin
  const monthName = (d) => new Date(d).toLocaleString('en-US', { month: 'short', year: '2-digit' });
  const group = (list, keyFn) => {
    const map = {};
    list.forEach((item) => { const k = keyFn(item); map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  };

  res.json({
    users: data.users.length,
    recruiters: count(data.users, (x) => x.role === 'recruiter'),
    candidates: count(data.users, (x) => x.role === 'candidate'),
    jobs: data.jobs.length,
    applications: data.applications.length,
    charts: {
      overview: [
        { name: 'Users', value: data.users.length },
        { name: 'Recruiters', value: count(data.users, (x) => x.role === 'recruiter') },
        { name: 'Candidates', value: count(data.users, (x) => x.role === 'candidate') },
        { name: 'Jobs', value: data.jobs.length },
        { name: 'Applications', value: data.applications.length },
      ],
      jobsByType: group(data.jobs, (j) => j.type),
      applicationsByStatus: group(data.applications, (a) => a.status),
      applicationsPerMonth: group(data.applications, (a) => monthName(a.createdAt)),
    },
  });
};
