import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, refreshSession, setAccessToken, setSessionLostHandler } from '../lib/api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const ROLE_LABEL = { admin: 'Admin', dosen: 'Dosen', mahasiswa: 'Mahasiswa' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSessionLostHandler(() => setUser(null));
    refreshSession().then((data) => {
      if (data) setUser(data.user);
      setReady(true);
    });
  }, []);

  const apply = (data) => {
    setAccessToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const login = useCallback(async (email, password) => apply(await api.post('/auth/login', { email, password })), []);
  const register = useCallback(async (payload) => apply(await api.post('/auth/register', payload)), []);
  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch { /* sesi lokal tetap dibersihkan */ }
    setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user, ready, login, register, logout,
    isStaff: user?.role === 'admin' || user?.role === 'dosen',
    isAdmin: user?.role === 'admin',
  }), [user, ready, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
