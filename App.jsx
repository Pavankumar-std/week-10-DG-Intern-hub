// ---------------------------------------------------------------
// App.jsx - all the pages (routes) of the website.
// lazy() = "code splitting": each page is downloaded only when it is opened.
// ---------------------------------------------------------------
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Spinner from './components/Loader';

import Jobs from './pages/Jobs'; // main page: loaded immediately
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const JobDetails = lazy(() => import('./pages/JobDetails'));
const CandidateDashboard = lazy(() => import('./pages/CandidateDashboard'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const NotFound = lazy(() => import('./pages/NotFound'));

export default function App() {
  return (
    <>
      <Navbar />
      <main className="page">
        <Suspense fallback={<Spinner text="Loading page..." />}>
          <Routes>
            <Route path="/" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Role-based dashboards */}
            <Route path="/candidate" element={<ProtectedRoute roles={['candidate']}><CandidateDashboard /></ProtectedRoute>} />
            <Route path="/recruiter" element={<ProtectedRoute roles={['recruiter']}><RecruiterDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <ToastContainer />
    </>
  );
}
