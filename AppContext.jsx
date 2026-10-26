// ---------------------------------------------------------------
// AppContext - app-wide things that are not "login":
//   * dark / light theme   (saved in localStorage)
//   * toast pop-ups
//   * notification panel (read / unread)
//   * saved jobs (for candidates)
// ---------------------------------------------------------------
import { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import useAuth from '../hooks/useAuth';
import { notificationsApi, usersApi } from '../services/api';

export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();

  // ---------- Theme ----------
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  const toggleTheme = useCallback(() => setTheme((t) => (t === 'light' ? 'dark' : 'light')), []);

  // ---------- Toasts ----------
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000); // auto-hide after 4 seconds
  }, [removeToast]);

  // ---------- Notifications ----------
  const [notifications, setNotifications] = useState([]);
  const loadNotifications = useCallback(async () => {
    if (!user) return setNotifications([]);
    try {
      const { data } = await notificationsApi.list();
      setNotifications(data.notifications);
    } catch {
      /* ignore - the bell just stays as it was */
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
    if (!user) return;
    const timer = setInterval(loadNotifications, 15000); // check again every 15s
    return () => clearInterval(timer);
  }, [user, loadNotifications]);

  const markRead = useCallback(async (id) => {
    setNotifications((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try { await notificationsApi.markRead(id); } catch { /* ignore */ }
  }, []);

  const markAllRead = useCallback(async () => {
    setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    try { await notificationsApi.markAllRead(); } catch { /* ignore */ }
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ---------- Saved jobs ----------
  const [savedIds, setSavedIds] = useState([]);
  useEffect(() => {
    if (user?.role !== 'candidate') return setSavedIds([]);
    usersApi.getSaved().then(({ data }) => setSavedIds(data.ids)).catch(() => {});
  }, [user]);

  const toggleSaved = useCallback(async (jobId) => {
    try {
      const { data } = await usersApi.toggleSaved(jobId);
      setSavedIds(data.ids);
      showToast(data.saved ? 'Job saved.' : 'Job removed from saved.', 'info');
    } catch {
      showToast('Could not update saved jobs.', 'error');
    }
  }, [showToast]);

  const value = useMemo(
    () => ({
      theme, toggleTheme, toasts, showToast, removeToast,
      notifications, unreadCount, markRead, markAllRead, loadNotifications,
      savedIds, toggleSaved,
    }),
    [theme, toggleTheme, toasts, showToast, removeToast, notifications, unreadCount,
      markRead, markAllRead, loadNotifications, savedIds, toggleSaved]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
