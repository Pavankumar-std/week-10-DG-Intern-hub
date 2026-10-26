import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import JobCard from '../components/JobCard';
import StatusTracker from '../components/StatusTracker';
import FormField from '../components/FormField';
import { SkeletonRows } from '../components/Loader';
import { ErrorState, EmptyState } from '../components/StateViews';
import useAuth from '../hooks/useAuth';
import useApp from '../hooks/useApp';
import { statsApi, applicationsApi, usersApi, jobsApi, getErrorMessage } from '../services/api';
import { rules } from '../utils/validation';
import { formatDate, statusClass } from '../utils/helpers';

const MENU = [
  { key: 'overview', label: 'Overview', icon: '🏠' },
  { key: 'profile', label: 'My Profile', icon: '👤' },
  { key: 'applied', label: 'Applied Jobs', icon: '📄' },
  { key: 'status', label: 'Application Status', icon: '📍' },
  { key: 'saved', label: 'Saved Jobs', icon: '⭐' },
  { key: 'recommended', label: 'Recommended Jobs', icon: '🎯' },
  { key: 'notifications', label: 'Notifications', icon: '🔔' },
];

export default function CandidateDashboard() {
  const { user, updateUser } = useAuth();
  const { showToast, notifications, markRead, markAllRead, savedIds, toggleSaved } = useApp();

  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [saved, setSaved] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load everything for this dashboard in one go
  const loadAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [s, a, sv, r] = await Promise.all([
        statsApi.get(), applicationsApi.mine(), usersApi.getSaved(), jobsApi.recommended(),
      ]);
      setStats(s.data);
      setApplications(a.data.applications);
      setSaved(sv.data.jobs);
      setRecommended(r.data.jobs);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { loadAll(); }, [loadAll]);

  // Reload saved list whenever a job is (un)saved
  useEffect(() => {
    usersApi.getSaved().then(({ data }) => setSaved(data.jobs)).catch(() => {});
  }, [savedIds]);

  // "Your profile is incomplete" warning (only once per visit)
  const profileIncomplete = !user.skills?.length || !user.bio;
  useEffect(() => {
    if (profileIncomplete) showToast('Your profile is incomplete. Add skills to get job matches.', 'warning');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleSave = useCallback((id) => toggleSaved(id), [toggleSaved]);

  const recent = useMemo(() => applications.slice(0, 3), [applications]);

  return (
    <DashboardLayout title="Candidate" items={MENU} active={tab} onSelect={setTab}>
      {loading && <SkeletonRows />}
      {!loading && error && <ErrorState message={error} onRetry={loadAll} />}

      {!loading && !error && tab === 'overview' && (
        <>
          <h1>Welcome, {user.name}</h1>
          <div className="stat-grid">
            <StatCard label="Applied Jobs" value={stats.applied} tone="blue" />
            <StatCard label="Shortlisted" value={stats.shortlisted} tone="teal" />
            <StatCard label="Interviews" value={stats.interviews} tone="purple" />
            <StatCard label="Rejected" value={stats.rejected} tone="red" />
          </div>
          <h2>Latest applications</h2>
          {recent.length === 0
            ? <EmptyState title="You have not applied yet." hint="Find a job you like and click Apply." action={<Link className="btn btn-primary" to="/">Browse jobs</Link>} />
            : recent.map((a) => (
              <div className="card app-card" key={a.id}>
                <strong>{a.job?.title || 'Job removed'}</strong>
                <span className="muted"> – {a.job?.company}</span>
                <StatusTracker status={a.status} />
              </div>
            ))}
        </>
      )}

      {!loading && !error && tab === 'profile' && (
        <ProfileForm user={user} onSaved={(u) => { updateUser(u); showToast('Profile updated.'); }} />
      )}

      {!loading && !error && tab === 'applied' && (
        <>
          <h1>Applied Jobs</h1>
          {applications.length === 0
            ? <EmptyState title="No applications yet." hint="Your applications will show up here." />
            : (
              <div className="table-wrap card">
                <table>
                  <thead><tr><th>Job</th><th>Company</th><th>Applied on</th><th>Status</th></tr></thead>
                  <tbody>
                    {applications.map((a) => (
                      <tr key={a.id}>
                        <td data-label="Job">{a.job ? <Link to={`/jobs/${a.job.id}`}>{a.job.title}</Link> : 'Job removed'}</td>
                        <td data-label="Company">{a.job?.company}</td>
                        <td data-label="Applied on">{formatDate(a.createdAt)}</td>
                        <td data-label="Status"><span className={`badge ${statusClass(a.status)}`}>{a.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </>
      )}

      {!loading && !error && tab === 'status' && (
        <>
          <h1>Application Status</h1>
          {applications.length === 0
            ? <EmptyState title="Nothing to track yet." />
            : applications.map((a) => (
              <div className="card app-card" key={a.id}>
                <strong>{a.job?.title || 'Job removed'}</strong> <span className="muted">– {a.job?.company}</span>
                <StatusTracker status={a.status} />
              </div>
            ))}
        </>
      )}

      {!loading && !error && tab === 'saved' && (
        <>
          <h1>Saved Jobs</h1>
          {saved.length === 0
            ? <EmptyState title="No saved jobs." hint="Tap the ☆ on a job card to save it." action={<Link className="btn btn-primary" to="/">Browse jobs</Link>} />
            : <div className="job-grid">{saved.map((j) => <JobCard key={j.id} job={j} showSave saved={savedIds.includes(j.id)} onToggleSave={handleToggleSave} />)}</div>}
        </>
      )}

      {!loading && !error && tab === 'recommended' && (
        <>
          <h1>Recommended Jobs</h1>
          <p className="muted">Matched using the skills on your profile: {user.skills?.join(', ') || 'none added yet'}.</p>
          {recommended.length === 0
            ? <EmptyState title="No matches yet." hint="Add skills to your profile to see recommendations." action={<button className="btn btn-primary" onClick={() => setTab('profile')}>Update profile</button>} />
            : <div className="job-grid">{recommended.map((j) => <JobCard key={j.id} job={j} showSave saved={savedIds.includes(j.id)} onToggleSave={handleToggleSave} />)}</div>}
        </>
      )}

      {!loading && !error && tab === 'notifications' && (
        <>
          <div className="row-between"><h1>Notifications</h1><button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button></div>
          {notifications.length === 0
            ? <EmptyState title="No notifications." />
            : <div className="card">{notifications.map((n) => (
              <div key={n.id} className={`notif-row ${n.read ? 'read' : 'unread'}`} onClick={() => markRead(n.id)}>
                <span>{n.message}</span><small className="muted">{formatDate(n.createdAt)}</small>
              </div>
            ))}</div>}
        </>
      )}
    </DashboardLayout>
  );
}

// ---------- Profile form (small component, same file) ----------
function ProfileForm({ user, onSaved }) {
  const { showToast } = useApp();
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors, dirtyFields } } = useForm({
    mode: 'onChange',
    defaultValues: { name: user.name, phone: user.phone, skills: (user.skills || []).join(', '), bio: user.bio || '' },
  });

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      const { data } = await usersApi.updateProfile(form);
      onSaved(data.user);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <h1>My Profile</h1>
      <form className="card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="muted">Email: {user.email}</p>
        <div className="form-grid">
          <FormField label="Full name" error={errors.name} isValid={dirtyFields.name && !errors.name}>
            <input {...register('name', rules.name)} />
          </FormField>
          <FormField label="Phone" error={errors.phone} isValid={dirtyFields.phone && !errors.phone}>
            <input {...register('phone', rules.phone)} />
          </FormField>
        </div>
        <FormField label="Skills (comma separated)" hint="Used to recommend jobs for you">
          <input placeholder="React, JavaScript, CSS" {...register('skills')} />
        </FormField>
        <FormField label="About me">
          <textarea rows="3" {...register('bio')} />
        </FormField>
        <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
      </form>
    </>
  );
}
