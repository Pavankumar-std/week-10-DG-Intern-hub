import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// Shortcut hook:  const { user, login, logout } = useAuth();
export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
