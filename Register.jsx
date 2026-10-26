import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuth from '../hooks/useAuth';
import useApp from '../hooks/useApp';
import FormField from '../components/FormField';
import { rules, confirmPassword } from '../utils/validation';
import { getErrorMessage } from '../services/api';
import { dashboardPath } from '../utils/helpers';

export default function Register() {
  const { user, register: registerUser } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, getValues, formState: { errors, dirtyFields } } = useForm({
    mode: 'onChange',
    defaultValues: { role: 'candidate' },
  });

  if (user) return <Navigate to={dashboardPath(user.role)} replace />;

  // helper: is this field filled in AND valid?
  const ok = (name) => dirtyFields[name] && !errors[name];

  const onSubmit = async (form) => {
    setServerError('');
    setLoading(true);
    try {
      const { name, email, password, phone, role } = form; // (confirmPassword is not sent)
      const created = await registerUser({ name, email, password, phone, role });
      showToast('Account created successfully!');
      navigate(dashboardPath(created.role), { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form className="card auth-card" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Create your account</h1>
        <p className="muted">Takes less than a minute.</p>

        {serverError && <div className="alert alert-error">✗ {serverError}</div>}

        <FormField label="Full name" error={errors.name} isValid={ok('name')}>
          <input autoComplete="name" {...register('name', rules.name)} />
        </FormField>
        <FormField label="Email" error={errors.email} isValid={ok('email')}>
          <input type="email" autoComplete="email" {...register('email', rules.email)} />
        </FormField>
        <FormField label="Phone" error={errors.phone} isValid={ok('phone')} hint="10 digits, no spaces">
          <input type="tel" inputMode="numeric" {...register('phone', rules.phone)} />
        </FormField>
        <FormField label="I am a...">
          <select {...register('role')}>
            <option value="candidate">Candidate (looking for jobs)</option>
            <option value="recruiter">Recruiter (hiring people)</option>
          </select>
        </FormField>
        <FormField label="Password" error={errors.password} isValid={ok('password')} hint="At least 8 characters and one number">
          <input type="password" autoComplete="new-password" {...register('password', rules.password)} />
        </FormField>
        <FormField label="Confirm password" error={errors.confirmPassword} isValid={ok('confirmPassword')}>
          <input type="password" autoComplete="new-password" {...register('confirmPassword', confirmPassword(getValues))} />
        </FormField>

        <button className="btn btn-primary btn-block" disabled={loading}>{loading ? 'Creating account...' : 'Register'}</button>
        <p className="center muted">Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </div>
  );
}
