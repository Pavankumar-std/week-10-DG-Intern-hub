import { useState } from 'react';
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth';
import useApp from '../hooks/useApp';
import FormField from '../components/FormField';
import { rules } from '../utils/validation';
import { getErrorMessage } from '../services/api';
import { dashboardPath } from '../utils/helpers';

const DEMO = [
  { label: 'Candidate', email: 'candidate@demo.com', password: 'Candidate@123' },
  { label: 'Recruiter', email: 'recruiter@demo.com', password: 'Recruiter@123' },
  { label: 'Admin', email: 'admin@demo.com', password: 'Admin@123' },
];

export default function Login() {
  const { user, login } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // react-hook-form handles typing, validation and errors for us
  const { register, handleSubmit, setValue, formState: { errors, dirtyFields } } = useForm({ mode: 'onChange' });

  // Already logged in? Go straight to the dashboard.
  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  const onSubmit = async ({ email, password }) => {
    setServerError('');
    setLoading(true);
    try {
      const loggedIn = await login(email, password);
      showToast(`Welcome back, ${loggedIn.name}!`);
      navigate(location.state?.from || dashboardPath(loggedIn.role), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (d) => {
    setValue('email', d.email, { shouldValidate: true, shouldDirty: true });
    setValue('password', d.password, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Welcome back</h1>
        <p className="muted">Log in to apply for jobs or manage your listings.</p>

        {serverError && <div className="alert alert-error">✗ {serverError}</div>}

        <FormField label="Email" error={errors.email} isValid={dirtyFields.email && !errors.email}>
          <input type="email" autoComplete="email" {...register('email', rules.email)} />
        </FormField>
        <FormField label="Password" error={errors.password} isValid={dirtyFields.password && !errors.password}>
          <input type="password" autoComplete="current-password" {...register('password', { required: 'Password is required' })} />
        </FormField>

        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Logging in...' : 'Log in'}</button>
        <p className="center muted">New here? <Link to="/register">Create an account</Link></p>

        <div className="demo-box">
          <small className="muted">Demo accounts (click to fill):</small>
          <div className="chips">
            {DEMO.map((d) => (
              <button type="button" key={d.label} className="btn btn-ghost btn-sm" onClick={() => fillDemo(d)}>{d.label}</button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
