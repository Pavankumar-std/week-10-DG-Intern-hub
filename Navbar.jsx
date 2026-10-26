import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useApp from '../hooks/useApp';
import { dashboardPath, formatDate } from '../utils/helpers';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, notifications, unreadCount, markRead, markAllRead, showToast } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);   // mobile menu
  const [bellOpen, setBellOpen] = useState(false);   // notification panel
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    showToast('You have been logged out.', 'info');
    navigate('/login');
  };

  const close = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={close}>Job<span>Hub</span></Link>

        <button className="icon-btn menu-btn" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open menu">
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Jobs</NavLink>
          {user && <NavLink to={dashboardPath(user.role)} onClick={close}>Dashboard</NavLink>}
          {!user && <NavLink to="/login" onClick={close}>Login</NavLink>}
          {!user && <NavLink to="/register" className="btn btn-primary btn-sm" onClick={close}>Sign up</NavLink>}
          {user && <span className="nav-user">{user.name} <small>({user.role})</small></span>}
          {user && <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Logout</button>}
        </nav>

        <div className="nav-actions">
          <button className="icon-btn" onClick={toggleTheme} aria-label="Switch theme" title="Switch theme">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {user && (
            <div className="bell-wrap">
              <button className="icon-btn" onClick={() => setBellOpen(!bellOpen)} aria-label="Notifications">
                🔔{unreadCount > 0 && <span className="bell-count">{unreadCount}</span>}
              </button>

              {bellOpen && (
                <div className="notif-panel card">
                  <div className="notif-head">
                    <strong>Notifications</strong>
                    <button className="link-btn" onClick={markAllRead}>Mark all read</button>
                  </div>
                  {notifications.length === 0 && <p className="muted pad">No notifications yet.</p>}
                  <ul>
                    {notifications.slice(0, 8).map((n) => (
                      <li key={n.id} className={n.read ? 'read' : 'unread'} onClick={() => markRead(n.id)}>
                        <span>{n.message}</span>
                        <small className="muted">{formatDate(n.createdAt)} {n.read ? '' : '• new'}</small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
