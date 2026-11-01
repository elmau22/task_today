import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const ROLE_LABEL = { admin: 'Admin', dosen: 'Dosen', mahasiswa: 'Mahasiswa' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  // Fungsi pembantu mengekstrak data profil dari sesi Supabase
  const formatUser = (sessionUser, profile = null) => {
    if (!sessionUser) return null;
    const meta = sessionUser.user_metadata || {};
    let role = profile?.role || meta.role || 'mahasiswa';
    // Berikan peran admin untuk akun admin utama
    if (sessionUser.email === 'admin@lokalkreatif.com') {
      role = 'admin';
    }
    const name = profile?.name || meta.name || sessionUser.email?.split('@')[0] || 'Pengguna';
    const nim = profile?.identity_number || meta.identity_number || '';
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name,
      role,
      identity_number: nim,
      nim,
      is_active: profile?.is_active ?? true,
    };
  };

  const syncProfile = useCallback(async (sessionUser) => {
    if (!sessionUser) {
      setUser(null);
      return;
    }
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', sessionUser.id)
        .maybeSingle();

      setUser(formatUser(sessionUser, profile));
    } catch {
      setUser(formatUser(sessionUser, null));
    }
  }, []);

  useEffect(() => {
    // 1. Cek sesi aktif Supabase saat awal muat
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncProfile(session.user);
      } else {
        // Cek fallback legacy local session jika ada
        try {
          const local = localStorage.getItem('portal_user_session');
          if (local) {
            const parsed = JSON.parse(local);
            setUser({
              id: 'local_user',
              name: parsed.name,
              email: `${parsed.nim || 'user'}@kampus.local`,
              role: 'admin',
              identity_number: parsed.nim || '',
              nim: parsed.nim || '',
            });
          }
        } catch {
          // Abaikan
        }
      }
      setReady(true);
    });

    // 2. Berlangganan perubahan sesi autentikasi Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncProfile(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [syncProfile]);

  const login = useCallback(async (email, password) => {
    // Dukung login legacy dengan NIM/Username jika diinput
    const cleanEmail = email.trim().toLowerCase();
    let authEmail = cleanEmail;
    if (!cleanEmail.includes('@')) {
      if (cleanEmail === 'elmau22' || cleanEmail === 'farael' || cleanEmail === 'admin') {
        authEmail = 'admin@lokalkreatif.com';
      } else {
        authEmail = `${cleanEmail}@kampus.local`;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (error) {
      // Fallback untuk akun offline/development
      if (
        (cleanEmail === 'admin@lokalkreatif.com' || cleanEmail === 'elmau22') &&
        (password === 'Admin12345' || password === '240511086')
      ) {
        const fallbackAdmin = {
          id: 'admin_local',
          email: 'admin@lokalkreatif.com',
          name: 'Mohamad Farael Maulana (Admin)',
          role: 'admin',
          identity_number: '240511086',
          nim: '240511086',
        };
        setUser(fallbackAdmin);
        localStorage.setItem('portal_user_session', JSON.stringify({ name: fallbackAdmin.name, nim: fallbackAdmin.nim }));
        return fallbackAdmin;
      }
      throw new Error(error.message || 'Email atau kata sandi tidak sesuai.');
    }

    await syncProfile(data.user);
    return data.user;
  }, [syncProfile]);

  const register = useCallback(async ({ name, email, identity_number, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          name: name.trim(),
          identity_number: identity_number ? identity_number.trim() : '',
          role: 'mahasiswa',
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Pendaftaran gagal. Silakan periksa data Anda.');
    }

    // Buat profil di tabel profiles jika ada
    if (data.user) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            identity_number: identity_number ? identity_number.trim() : '',
            role: 'mahasiswa',
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // Abaikan jika tabel profiles belum dibuat
      }
      await syncProfile(data.user);
    }

    return data.user;
  }, [syncProfile]);

  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Abaikan
    }
    localStorage.removeItem('portal_user_session');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      login,
      register,
      logout,
      isStaff: user?.role === 'admin' || user?.role === 'dosen',
      isAdmin: user?.role === 'admin',
    }),
    [user, ready, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
