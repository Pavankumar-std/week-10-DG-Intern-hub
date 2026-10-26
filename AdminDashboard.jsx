import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { SkeletonRows } from '../components/Loader';
import { ErrorState, EmptyState } from '../components/StateViews';
import useApp from '../hooks/useApp';
import { statsApi, usersApi, jobsApi, getErrorMessage } from '../services/api';
import { formatDate, formatSalary } from '../utils/helpers';

const MENU = [
  { key: 'overview', label: 'Overview & Charts', icon: '📊' },
  { key: 'users', label: 'Users', icon: '👥' },
  { key: 'jobs', label: 'Jobs', icon: '💼' },
];
const COLORS = ['#2f6df6', '#12a594', '#8b5cf6', '#f59e0b', '#ef4444', '#64748b'];

export default function AdminDashboard() {
  const { showToast } = useApp();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, u, j] = await Promise.all([statsApi.get(), usersApi.list(), jobsApi.getAll({ limit: 100 })]);
      setStats(s.data);
      setUsers(u.data.users);
      setJobs(j.data.jobs);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  const toggleUser = async (u) => {
    try {
      await usersApi.toggleDisable(u.id);
      showToast(u.disabled ? `${u.name} was enabled.` : `${u.name} was disabled.`, 'info');
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const removeJob = async (job) => {
    if (!window.confirm(`Remove "${job.title}" from the portal?`)) return;
    try {
      await jobsApi.remove(job.id);
      showToast('Job removed.', 'info');
      loadAll();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  const visibleUsers = users.filter((u) => !roleFilter || u.role === roleFilter);

  return (
    <DashboardLayout title="Admin" items={MENU} active={tab} onSelect={setTab}>
      {loading && <SkeletonRows />}
      {!loading && error && <ErrorState message={error} onRetry={loadAll} />}

      {!loading && !error && tab === 'overview' && (
        <>
          <h1>Admin Dashboard</h1>
          <div className="stat-grid five">
            <StatCard label="Users" value={stats.users} tone="blue" />
            <StatCard label="Recruiters" value={stats.recruiters} tone="purple" />
            <StatCard label="Candidates" value={stats.candidates} tone="teal" />
            <StatCard label="Jobs" value={stats.jobs} tone="green" />
            <StatCard label="Applications" value={stats.applications} tone="red" />
          </div>

          <div className="chart-grid">
            <div className="card chart-card">
              <h3>Platform overview</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={stats.charts.overview}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis allowDecimals={false} fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2f6df6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-card">
              <h3>Jobs by type</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={stats.charts.jobsByType} dataKey="value" nameKey="name" outerRadius={85} label>
                    {stats.charts.jobsByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend /><Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card chart-card">
              <h3>Applications by status</h3>
              {stats.charts.applicationsByStatus.length === 0 ? <p className="muted">No applications yet.</p> : (
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={stats.charts.applicationsByStatus} dataKey="value" nameKey="name" outerRadius={85} label>
                      {stats.charts.applicationsByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Legend /><Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="card chart-card">
              <h3>Applications per month</h3>
              {stats.charts.applicationsPerMonth.length === 0 ? <p className="muted">No applications yet.</p> : (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.charts.applicationsPerMonth}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#12a594" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}

      {!loading && !error && tab === 'users' && (
        <>
          <div className="row-between">
            <h1>Users</h1>
            <div className="sort-box">
              <label htmlFor="roleFilter">Show</label>
              <select id="roleFilter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="">Everyone</option>
                <option value="recruiter">Recruiters</option>
                <option value="candidate">Candidates</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>
          {visibleUsers.length === 0 ? <EmptyState title="No users found." /> : (
            <div className="table-wrap card">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {visibleUsers.map((u) => (
                    <tr key={u.id}>
                      <td data-label="Name">{u.name}</td>
                      <td data-label="Email">{u.email}</td>
                      <td data-label="Role"><span className="badge badge-blue">{u.role}</span></td>
                      <td data-label="Joined">{formatDate(u.createdAt)}</td>
                      <td data-label="Status"><span className={`badge ${u.disabled ? 'badge-red' : 'badge-green'}`}>{u.disabled ? 'Disabled' : 'Active'}</span></td>
                      <td data-label="Action">
                        {u.role !== 'admin' && (
                          <button className={`btn btn-sm ${u.disabled ? 'btn-ghost' : 'btn-danger'}`} onClick={() => toggleUser(u)}>
                            {u.disabled ? 'Enable' : 'Disable'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {!loading && !error && tab === 'jobs' && (
        <>
          <h1>Jobs</h1>
          {jobs.length === 0 ? <EmptyState title="No jobs on the portal." /> : (
            <div className="table-wrap card">
              <table>
                <thead><tr><th>Title</th><th>Company</th><th>Type</th><th>Salary</th><th>Posted</th><th>Action</th></tr></thead>
                <tbody>
                  {jobs.map((j) => (
                    <tr key={j.id}>
                      <td data-label="Title"><Link to={`/jobs/${j.id}`}>{j.title}</Link></td>
                      <td data-label="Company">{j.company}</td>
                      <td data-label="Type">{j.type}</td>
                      <td data-label="Salary">{formatSalary(j.salary)}</td>
                      <td data-label="Posted">{formatDate(j.createdAt)}</td>
                      <td data-label="Action"><button className="btn btn-danger btn-sm" onClick={() => removeJob(j)}>Remove</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
