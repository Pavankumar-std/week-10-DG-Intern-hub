import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { dashboardPath } from '../utils/helpers';

// Wrap a page with this to protect it.
//   <ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>
export default function ProtectedRoute({ roles, children }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in -> go to login (remember where they wanted to go)
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;

  // Logged in but wrong role -> send them to THEIR dashboard
  if (roles && !roles.includes(user.role)) return <Navigate to={dashboardPath(user.role)} replace />;

  return children;
}
