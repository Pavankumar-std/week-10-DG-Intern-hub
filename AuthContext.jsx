// ---------------------------------------------------------------
// AuthContext - the "global" login state (Task 2).
// Any component can read the user with: const { user } = useAuth();
// ---------------------------------------------------------------
import { createContext, useState, useMemo, useCallback } from 'react';
import { authApi } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Start with whatever is saved in localStorage -> login survives refresh
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user'));
    } catch {
      return null;
    }
  });

  const saveSession = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    saveSession(data);
    return data.user;
  }, []);

  const register = useCallback(async (form) => {
    const { data } = await authApi.register(form);
    saveSession(data);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  // Call this after the profile is edited so the whole app updates
  const updateUser = useCallback((newUser) => {
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  // useMemo: only create a new "value" object when something really changed
  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, login, register, logout, updateUser }),
    [user, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
