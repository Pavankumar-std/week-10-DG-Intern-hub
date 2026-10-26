import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth';
import useApp from '../hooks/useApp';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import { Spinner } from '../components/Loader';
import { ErrorState } from '../components/StateViews';
import { jobsApi, applicationsApi, getErrorMessage } from '../services/api';
import { rules } from '../utils/validation';
import { formatSalary, formatDate } from '../utils/helpers';

export default function JobDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast, loadNotifications } = useApp();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [applied, setApplied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, dirtyFields } } = useForm({ mode: 'onChange' });
  const ok = (name) => dirtyFields[name] && !errors[name];

  const loadJob = () => {
    setLoading(true);
    setError('');
    jobsApi.getOne(id)
      .then(({ data }) => setJob(data.job))
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  };
  useEffect(loadJob, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Did this candidate already apply?
  useEffect(() => {
    if (user?.role !== 'candidate') return;
    applicationsApi.mine()
      .then(({ data }) => setApplied(data.applications.some((a) => a.jobId === id)))
      .catch(() => {});
  }, [user, id]);

  const onApply = async (form) => {
    setSubmitting(true);
    try {
      await applicationsApi.apply({ ...form, jobId: id });
      showToast('Application submitted successfully.');
      setApplied(true);
      setShowForm(false);
      reset();
      loadNotifications();
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner text="Loading job..." />;
  if (error) return <ErrorState message={error} onRetry={loadJob} />;

  return (
    <div className="details">
      <Link to="/" className="back-link">← Back to jobs</Link>
      <div className="card details-card">
        <h1>{job.title}</h1>
        <p className="muted">{job.company} • {job.location}</p>
        <div className="chips">
          <span className="badge badge-blue">{job.type}</span>
          <span className="badge badge-gray">{job.workMode}</span>
          <span className="badge badge-gray">{job.experience === 0 ? 'Fresher' : `${job.experience}+ years`}</span>
          <span className="badge badge-green">{formatSalary(job.salary)}</span>
        </div>

        <h3>About the role</h3>
        <p>{job.description}</p>

        <h3>Skills needed</h3>
        <div className="chips skills">{job.skills.map((s) => <span key={s} className="skill">{s}</span>)}</div>
        <p className="muted">Posted on {formatDate(job.createdAt)}</p>

        <div className="apply-box">
          {!user && <Link className="btn btn-primary" to="/login" state={{ from: `/jobs/${id}` }}>Log in to apply</Link>}
          {user?.role === 'candidate' && (applied
            ? <span className="badge badge-green big">✓ You have applied for this job</span>
            : <button className="btn btn-primary" onClick={() => setShowForm(true)}>Apply now</button>)}
          {user && user.role !== 'candidate' && <p className="muted">Only candidates can apply for jobs.</p>}
        </div>
      </div>

      {showForm && (
        <Modal title={`Apply: ${job.title}`} onClose={() => setShowForm(false)}>
          <form onSubmit={handleSubmit(onApply)} noValidate>
            <FormField label="Resume link" error={errors.resume} isValid={ok('resume')} hint="Paste a Google Drive / Dropbox link to your resume">
              <input placeholder="https://..." {...register('resume', rules.resume)} />
            </FormField>
            <FormField label="Cover letter" error={errors.coverLetter} isValid={ok('coverLetter')}>
              <textarea rows="4" {...register('coverLetter', rules.coverLetter)} />
            </FormField>
            <FormField label="Skills" error={errors.skills} isValid={ok('skills')}>
              <input placeholder="React, JavaScript" {...register('skills', rules.skills)} />
            </FormField>
            <FormField label="Education" error={errors.education} isValid={ok('education')}>
              <input placeholder="B.Tech Computer Science" {...register('education', rules.education)} />
            </FormField>
            <FormField label="Experience" error={errors.experience} isValid={ok('experience')}>
              <input placeholder="Fresher / 1 year at XYZ" {...register('experience', rules.experience)} />
            </FormField>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit application'}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
