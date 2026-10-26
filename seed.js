// ---------------------------------------------------------------
// seed.js - creates demo users + jobs the first time the server runs.
// Run "npm run reseed" to reset everything back to the demo data.
// ---------------------------------------------------------------
const bcrypt = require('bcryptjs');
const { data, save, nextId } = require('./db');

function daysAgo(n) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

function seed() {
  data.users = [];
  data.jobs = [];
  data.applications = [];
  data.notifications = [];

  const mk = (name, email, password, role, extra = {}) => ({
    id: nextId(), name, email, role, phone: '9876543210',
    password: bcrypt.hashSync(password, 10),
    skills: [], bio: '', savedJobs: [], disabled: false,
    createdAt: daysAgo(30), ...extra,
  });

  const admin = mk('Admin User', 'admin@demo.com', 'Admin@123', 'admin');
  const recruiter = mk('Riya Recruiter', 'recruiter@demo.com', 'Recruiter@123', 'recruiter');
  const recruiter2 = mk('Sam Hiring', 'sam@demo.com', 'Recruiter@123', 'recruiter');
  const candidate = mk('Chandan Candidate', 'candidate@demo.com', 'Candidate@123', 'candidate', {
    skills: ['React', 'JavaScript', 'CSS'], bio: 'Final-year student who loves building web apps.',
  });
  data.users.push(admin, recruiter, recruiter2, candidate);

  const jobList = [
    ['React Developer Intern', 'PixelWorks', 'Remote', 'Internship', 'Remote', 0, 15000, ['React', 'JavaScript', 'CSS'], 2, recruiter],
    ['Frontend Developer', 'BrightApps', 'Bangalore', 'Full-time', 'Hybrid', 2, 60000, ['React', 'Redux', 'TypeScript'], 5, recruiter],
    ['Node.js Backend Intern', 'CloudNine', 'Remote', 'Internship', 'Remote', 0, 12000, ['Node.js', 'Express', 'MongoDB'], 8, recruiter],
    ['Full Stack Developer', 'TechNova', 'Pune', 'Full-time', 'On-site', 3, 85000, ['React', 'Node.js', 'MongoDB'], 10, recruiter],
    ['UI/UX Design Intern', 'Designly', 'Mumbai', 'Internship', 'On-site', 0, 10000, ['Figma', 'CSS', 'HTML'], 12, recruiter2],
    ['Python Data Analyst', 'DataDock', 'Hyderabad', 'Full-time', 'Hybrid', 1, 55000, ['Python', 'SQL', 'Excel'], 14, recruiter2],
    ['Mobile App Intern', 'AppForge', 'Remote', 'Internship', 'Remote', 0, 14000, ['React Native', 'JavaScript'], 3, recruiter2],
    ['DevOps Engineer', 'InfraLabs', 'Chennai', 'Full-time', 'On-site', 4, 110000, ['Docker', 'AWS', 'Linux'], 20, recruiter],
    ['Part-time Web Tutor', 'LearnLoop', 'Remote', 'Part-time', 'Remote', 1, 20000, ['HTML', 'CSS', 'JavaScript'], 6, recruiter2],
    ['QA Test Engineer', 'BugBusters', 'Delhi', 'Full-time', 'On-site', 2, 50000, ['Testing', 'Selenium', 'JavaScript'], 9, recruiter],
    ['Machine Learning Intern', 'NeuralNest', 'Remote', 'Internship', 'Remote', 0, 18000, ['Python', 'Machine Learning'], 1, recruiter2],
    ['JavaScript Developer', 'CodeCraft', 'Kolkata', 'Full-time', 'Hybrid', 2, 65000, ['JavaScript', 'React', 'Node.js'], 4, recruiter],
  ];

  jobList.forEach(([title, company, location, type, workMode, experience, salary, skills, age, owner]) => {
    data.jobs.push({
      id: nextId(), title, company, location, type, workMode, experience, salary, skills,
      description: `We are looking for a ${title} to join ${company}. You will work with a friendly team, learn quickly and build real features used by real customers.`,
      recruiterId: owner.id, status: 'active', createdAt: daysAgo(age),
    });
  });

  // One demo application so dashboards are not empty
  data.applications.push({
    id: nextId(), jobId: data.jobs[0].id, candidateId: candidate.id,
    resume: 'https://example.com/chandan-resume.pdf',
    coverLetter: 'I enjoy React and would love to learn from your team.',
    skills: 'React, JavaScript', education: 'B.Tech Computer Science', experience: 'Two college projects',
    status: 'Under Review', createdAt: daysAgo(2),
  });
  data.notifications.push({
    id: nextId(), userId: candidate.id, type: 'success',
    message: 'Welcome to the Job Portal! Complete your profile to get better matches.',
    read: false, createdAt: daysAgo(1),
  });

  save();
  console.log('Demo data created.');
}

module.exports = seed;

// "node seed.js --force" resets the data file
if (require.main === module) seed();
