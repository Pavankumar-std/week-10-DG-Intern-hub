// Small helper functions used in many places.

// Where should each role land after login?
export const dashboardPath = (role) =>
  ({ candidate: '/candidate', recruiter: '/recruiter', admin: '/admin' }[role] || '/');

export const formatSalary = (n) => `₹${Number(n).toLocaleString('en-IN')}/mo`;

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const STATUS_STEPS = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Selected'];

// CSS class for a status badge
export const statusClass = (status) =>
  ({
    Applied: 'badge-gray', 'Under Review': 'badge-blue', Shortlisted: 'badge-teal',
    Interview: 'badge-purple', Selected: 'badge-green', Rejected: 'badge-red',
  }[status] || 'badge-gray');
