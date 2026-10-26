import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import Modal from '../components/Modal';
import JobForm from '../components/JobForm';
import { SkeletonRows } from '../components/Loader';
import { ErrorState, EmptyState } from '../components/StateViews';
import useAuth from '../hooks/useAuth';
import useApp from '../hooks/useApp';
import useDebounce from '../hooks/useDebounce';
import { statsApi, jobsApi, applicationsApi, getErrorMessage } from '../services/api';
import { formatDate, formatSalary, statusClass } from '../utils/helpers';

const MENU = [
  { key: 'overview', label: 'Overview', icon: '🏠' },
  { key: 'jobs', label: 'My Jobs', icon: '💼' },
  { key: 'applicants', label: 'Applicants', icon: '🧑‍💻' },
];
const STATUSES = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected', 'Rejected'];

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { showToast } = useApp();

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(null);   // null | 'new' | job object
  const [saving, setSaving] = useState(false);
  const [selectedJob, setSelectedJob] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, j] = await Promise.all([statsApi.get(), jobsApi.mine()]);
      setStats(s.data);
      setJobs(j.data.jobs);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  // ----- Create / edit -----
  const saveJob = async (form) => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await jobsApi.create(form);
        showToast('Job created successfully.');
      } else {
        await jobsApi.update(editing.id, form);
        showToast('Job updated successfully.');
      }
      setEditing(null);
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  // ----- Delete -----
  const deleteJob = async (job) => {
    if (!window.confirm(`Delete "${job.title}"? Its applications will be deleted too.`)) return;
    try {
      await jobsApi.remove(job.id);
      showToast('Job deleted.', 'info');
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const viewApplicants = (jobId) => { setSelectedJob(jobId); setTab('applicants'); };

  return (
    <DashboardLayout title="Recruiter" items={MENU} active={tab} onSelect={setTab}>
      {loading && <SkeletonRows />}
      {!loading && error && <ErrorState message={error} onRetry={loadAll} />}

      {!loading && !error && tab === 'overview' && (
        <>
          <h1>Hello, {user.name}</h1>
          <div className="stat-grid">
            <StatCard label="Active Jobs" value={stats.activeJobs} tone="blue" />
            <StatCard label="Applications" value={stats.applications} tone="teal" />
            <StatCard label="Shortlisted" value={stats.shortlisted} tone="purple" />
            <StatCard label="Interviews" value={stats.interviews} tone="green" />
          </div>
          <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Create job</button>
        </>
      )}

      {!loading && !error && tab === 'jobs' && (
        <>
          <div className="row-between">
            <h1>My Jobs</h1>
            <button className="btn btn-primary" onClick={() => setEditing('new')}>+ Create job</button>
          </div>
          {jobs.length === 0
            ? <EmptyState title="You have not posted any jobs." hint="Create your first job to start receiving applications." />
            : (
              <div className="table-wrap card">
                <table>
                  <thead><tr><th>Title</th><th>Type</th><th>Salary</th><th>Applicants</th><th>Posted</th><th>Actions</th></tr></thead>
                  <tbody>
                    {jobs.map((j) => (
                      <tr key={j.id}>
                        <td data-label="Title"><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                        <td data-label="Type">{j.type}</td>
                        <td data-label="Salary">{formatSalary(j.salary)}</td>
                        <td data-label="Applicants">{j.applicants}</td>
                        <td data-label="Posted">{formatDate(j.createdAt)}</td>
                        <td data-label="Actions" className="actions">
                          <button className="btn btn-ghost btn-sm" onClick={() => viewApplicants(j.id)}>Applicants</button>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(j)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteJob(j)}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}

      {!loading && !error && tab === 'applicants' && (
        <Applicants jobs={jobs} selectedJob={selectedJob} setSelectedJob={setSelectedJob} onChanged={loadAll} />
      )}

      {editing && (
        <Modal title={editing === 'new' ? 'Create job' : 'Edit job'} onClose={() => setEditing(null)}>
          <JobForm initial={editing === 'new' ? null : editing} onSubmit={saveJob} onCancel={() => setEditing(null)} saving={saving} />
        </Modal>
      )}
    </DashboardLayout>
  );
}

// ---------- Applicants list ----------
function Applicants({ jobs, selectedJob, setSelectedJob, onChanged }) {
  const { showToast } = useApp();
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const debouncedSearch = useDebounce(search, 400);

  const load = useCallback(async () => {
    if (!selectedJob) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await applicationsApi.forJob(selectedJob, debouncedSearch);
      setApps(data.applications);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [selectedJob, debouncedSearch]);
  useEffect(() => { load(); }, [load]);

  const changeStatus = async (id, status) => {
    try {
      await applicationsApi.updateStatus(id, status);
      showToast(`Status updated to ${status}.`);
      load();
      onChanged();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <>
      <h1>Applicants</h1>
      <div className="card filter-box">
        <div className="filter-grid">
          <div className="field">
            <label htmlFor="jobSelect">Choose a job</label>
            <select id="jobSelect" value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
              <option value="">-- select --</option>
              {jobs.map((j) => <option key={j.id} value={j.id}>{j.title} ({j.applicants})</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="appSearch">Search applicants</label>
            <input id="appSearch" placeholder="Name or skill" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {!selectedJob && <EmptyState title="Select a job to see its applicants." />}
      {selectedJob && loading && <SkeletonRows rows={3} />}
      {selectedJob && !loading && error && <ErrorState message={error} onRetry={load} />}
      {selectedJob && !loading && !error && apps.length === 0 && <EmptyState title="No applicants found." hint="Try a different search or wait for new applications." />}
      {selectedJob && !loading && !error && apps.length > 0 && (
        <div className="table-wrap card">
          <table>
            <thead><tr><th>Candidate</th><th>Skills</th><th>Education</th><th>Resume</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {apps.map((a) => (
                <tr key={a.id}>
                  <td data-label="Candidate"><strong>{a.candidate?.name}</strong><br /><small className="muted">{a.candidate?.email}</small></td>
                  <td data-label="Skills">{a.skills}</td>
                  <td data-label="Education">{a.education}</td>
                  <td data-label="Resume"><a href={a.resume} target="_blank" rel="noreferrer">Open</a></td>
                  <td data-label="Status">
                    <select value={a.status} onChange={(e) => changeStatus(a.id, e.target.value)} className={`status-select ${statusClass(a.status)}`}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td data-label="Actions" className="actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => changeStatus(a.id, 'Shortlisted')}>Shortlist</button>
                    <button className="btn btn-danger btn-sm" onClick={() => changeStatus(a.id, 'Rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
