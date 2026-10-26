// ---------------------------------------------------------------
// utils/validation.js - reusable validation rules for React Hook Form.
// Use like:   <input {...register('email', rules.email)} />
// ---------------------------------------------------------------
export const rules = {
  name: {
    required: 'Name is required',
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
  },
  email: {
    required: 'Email is required',
    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' },
  },
  password: {
    required: 'Password is required',
    minLength: { value: 8, message: 'Password must contain at least 8 characters' },
    validate: (v) => /\d/.test(v) || 'Password must contain at least one number',
  },
  phone: {
    required: 'Phone number is required',
    pattern: { value: /^[0-9]{10}$/, message: 'Phone must be exactly 10 digits' },
  },
  resume: {
    required: 'Resume is required',
    pattern: { value: /^https?:\/\/.+/i, message: 'Resume must be a link starting with http:// or https://' },
  },
  coverLetter: {
    required: 'Cover letter is required',
    minLength: { value: 30, message: 'Cover letter must be at least 30 characters' },
  },
  skills: { required: 'Skills are required' },
  education: { required: 'Education is required' },
  experience: { required: 'Experience is required (write "Fresher" if none)' },
};

// Used for "Confirm password":  validate: confirmPassword(watch)
export const confirmPassword = (getValues) => ({
  required: 'Please confirm your password',
  validate: (v) => v === getValues('password') || 'Passwords do not match',
});
