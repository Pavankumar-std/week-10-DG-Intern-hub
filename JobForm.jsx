import { useForm } from 'react-hook-form';
import FormField from './FormField';

// Used by recruiters to CREATE or EDIT a job (same form, different starting values).
export default function JobForm({ initial, onSubmit, onCancel, saving }) {
  const {
    register, handleSubmit, formState: { errors, dirtyFields },
  } = useForm({
    mode: 'onChange',
    defaultValues: initial
      ? { ...initial, skills: initial.skills.join(', ') }
      : { title: '', company: '', location: '', type: 'Internship', workMode: 'Remote', experience: 0, salary: '', skills: '', description: '' },
  });

  const ok = (name) => dirtyFields[name] && !errors[name];

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="form-grid">
        <FormField label="Job title" error={errors.title} isValid={ok('title')}>
          <input {...register('title', { required: 'Job title is required', minLength: { value: 3, message: 'At least 3 characters' } })} />
        </FormField>
        <FormField label="Company" error={errors.company} isValid={ok('company')}>
          <input {...register('company', { required: 'Company is required' })} />
        </FormField>
        <FormField label="Location" error={errors.location} isValid={ok('location')}>
          <input {...register('location', { required: 'Location is required' })} />
        </FormField>
        <FormField label="Monthly salary (₹)" error={errors.salary} isValid={ok('salary')}>
          <input type="number" {...register('salary', { required: 'Salary is required', min: { value: 0, message: 'Cannot be negative' } })} />
        </FormField>
        <FormField label="Job type">
          <select {...register('type')}><option>Internship</option><option>Full-time</option><option>Part-time</option></select>
        </FormField>
        <FormField label="Work mode">
          <select {...register('workMode')}><option>Remote</option><option>On-site</option><option>Hybrid</option></select>
        </FormField>
        <FormField label="Years of experience" error={errors.experience}>
          <input type="number" {...register('experience', { min: { value: 0, message: 'Cannot be negative' } })} />
        </FormField>
        <FormField label="Skills (comma separated)" error={errors.skills} isValid={ok('skills')}>
          <input placeholder="React, Node.js" {...register('skills', { required: 'Add at least one skill' })} />
        </FormField>
      </div>
      <FormField label="Description" error={errors.description} isValid={ok('description')}>
        <textarea rows="4" {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'Description must be at least 20 characters' } })} />
      </FormField>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : initial ? 'Save changes' : 'Create job'}</button>
      </div>
    </form>
  );
}
