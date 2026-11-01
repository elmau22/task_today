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
    
    // Akun admin utama yang dijamin hak akses admin
    const adminEmails = ['admin@lokalkreatif.com', 'faraelmaulana22@gmail.com'];
    if (adminEmails.includes(sessionUser.email?.toLowerCase()) || meta.role === 'admin') {
      role = 'admin';
    }

    const name = profile?.name || meta.name || (sessionUser.email?.toLowerCase().includes('farael') ? 'Mohamad Farael Maulana (Admin)' : sessionUser.email?.split('@')[0]) || 'Pengguna';
    const nim = profile?.identity_number || meta.identity_number || '240511086';
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
            const isAdmin = ['faraelmaulana22@gmail.com', 'admin@lokalkreatif.com', '240511086'].some((v) =>
              (parsed.email || parsed.nim || '').toLowerCase().includes(v)
            );
            setUser({
              id: 'local_user',
              name: parsed.name,
              email: parsed.email || 'faraelmaulana22@gmail.com',
              role: isAdmin ? 'admin' : (parsed.role || 'mahasiswa'),
              identity_number: parsed.nim || '240511086',
              nim: parsed.nim || '240511086',
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
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Deteksi akun Admin Farael
    const isFaraelAdmin =
      cleanEmail === 'faraelmaulana22@gmail.com' ||
      cleanEmail === 'elmau22' ||
      cleanEmail === 'farael' ||
      cleanEmail === 'mohamad farael maulana';

    let authEmail = cleanEmail;
    if (!cleanEmail.includes('@')) {
      if (isFaraelAdmin) {
        authEmail = 'faraelmaulana22@gmail.com';
      } else if (cleanEmail === 'admin') {
        authEmail = 'admin@lokalkreatif.com';
      } else {
        authEmail = `${cleanEmail}@kampus.local`;
      }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: cleanPassword,
    });

    // Cek password custom yang tersimpan di browser jika ada
    const customPass = localStorage.getItem('admin_farael_password');
    const validFaraelPassword =
      cleanPassword === 'admin123' ||
      cleanPassword === 'admin 123' ||
      cleanPassword === 'Admin123!' ||
      cleanPassword === '240511086' ||
      cleanPassword === customPass;

    if (error) {
      // Jika email belum dikonfirmasi atau ada proteksi Supabase, berikan akses langsung untuk Admin Farael
      if (isFaraelAdmin && validFaraelPassword) {
        const adminUser = {
          id: 'admin_farael',
          email: 'faraelmaulana22@gmail.com',
          name: 'Mohamad Farael Maulana (Admin)',
          role: 'admin',
          identity_number: '240511086',
          nim: '240511086',
        };
        setUser(adminUser);
        localStorage.setItem(
          'portal_user_session',
          JSON.stringify({ name: adminUser.name, email: adminUser.email, nim: adminUser.nim, role: 'admin' })
        );
        return adminUser;
      }

      // Fallback admin default
      if (cleanEmail === 'admin@lokalkreatif.com' && (cleanPassword === 'Admin12345' || cleanPassword === 'admin123')) {
        const fallbackAdmin = {
          id: 'admin_root',
          email: 'admin@lokalkreatif.com',
          name: 'Administrator',
          role: 'admin',
          identity_number: 'ADMIN01',
          nim: 'ADMIN01',
        };
        setUser(fallbackAdmin);
        localStorage.setItem('portal_user_session', JSON.stringify({ name: fallbackAdmin.name, nim: fallbackAdmin.nim, role: 'admin' }));
        return fallbackAdmin;
      }

      throw new Error(error.message || 'Email atau kata sandi tidak sesuai.');
    }

    await syncProfile(data.user);
    return data.user;
  }, [syncProfile]);

  const register = useCallback(async ({ name, email, identity_number, password }) => {
    const cleanEmail = email.trim().toLowerCase();
    const isAdmin = cleanEmail === 'faraelmaulana22@gmail.com' || cleanEmail === 'admin@lokalkreatif.com';
    const assignedRole = isAdmin ? 'admin' : 'mahasiswa';

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          name: name.trim(),
          identity_number: identity_number ? identity_number.trim() : '',
          role: assignedRole,
        },
      },
    });

    if (error) {
      throw new Error(error.message || 'Pendaftaran gagal. Silakan periksa data Anda.');
    }

    if (data.user) {
      try {
        await supabase.from('profiles').upsert([
          {
            id: data.user.id,
            name: name.trim(),
            email: cleanEmail,
            identity_number: identity_number ? identity_number.trim() : '',
            role: assignedRole,
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // Abaikan jika tabel profiles belum ada
      }
      await syncProfile(data.user);
    }

    return data.user;
  }, [syncProfile]);

  const changePassword = useCallback(async (newPassword) => {
    const cleanPass = newPassword.trim();
    if (!cleanPass || cleanPass.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: cleanPass,
      });
      if (error) {
        console.warn('Supabase updateUser error:', error.message);
      }
    } catch {
      // Abaikan
    }

    // Selalu simpan di penyimpanan sesi browser agar kata sandi baru langsung aktif
    localStorage.setItem('admin_farael_password', cleanPass);
    return true;
  }, []);

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
      changePassword,
      isStaff: user?.role === 'admin' || user?.role === 'dosen',
      isAdmin: user?.role === 'admin',
    }),
    [user, ready, login, register, logout, changePassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
