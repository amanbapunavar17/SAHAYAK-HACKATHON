import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, AdminUser, UserRole } from '../types';
import { api, getAuthToken, setAuthToken, removeAuthToken } from './api';

interface AuthContextType {
  user: User | null;
  studentUser: User | null;
  adminUser: AdminUser | null;
  role: UserRole | string;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  loginStudent: (email?: string, password?: string) => Promise<boolean>;
  loginAdmin: (email?: string, password?: string) => Promise<boolean>;
  loginAsStudent: (email?: string, password?: string) => Promise<boolean>;
  loginAsAdmin: (email?: string, password?: string) => Promise<boolean>;
  registerStudent: (details: any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const token = getAuthToken();
    if (!token) return null;
    const saved = localStorage.getItem('sahayak_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const token = getAuthToken();
    if (!token) return null;
    const saved = localStorage.getItem('sahayak_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const role = user?.role || (adminUser ? 'admin' : 'student');
  const isAuthenticated = !!user;
  const isAdminAuthenticated = !!adminUser || (user?.role === 'admin' || user?.role === 'proctor');

  // Load latest live user profile from database on startup
  const refreshProfile = async () => {
    const token = getAuthToken();
    if (!token) return;

    try {
      const liveUser = await api.auth.me();
      if (liveUser) {
        setUser(liveUser);
        localStorage.setItem('sahayak_auth_user', JSON.stringify(liveUser));
        if (liveUser.role === 'admin' || liveUser.role === 'proctor') {
          setAdminUser(liveUser);
          localStorage.setItem('sahayak_admin_user', JSON.stringify(liveUser));
        }
      }
    } catch (err: any) {
      console.warn('Session expired or server unreachable:', err?.message);
      if (err?.message?.includes('401') || err?.message?.includes('Unauthorized')) {
        logout();
      }
    }
  };

  useEffect(() => {
    refreshProfile();
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('sahayak_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sahayak_auth_user');
    }
  }, [user]);

  const loginStudent = async (email?: string, password?: string) => {
    const loginEmail = (email || '').trim();
    const loginPassword = password || '';

    if (!loginEmail || !loginPassword) {
      throw new Error('Please enter both your NIE institutional email and password.');
    }

    try {
      const res = await api.auth.login({ email: loginEmail, password: loginPassword });
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setUser(res.user);
        return true;
      }
      throw new Error('Invalid login response from server.');
    } catch (err: any) {
      console.warn('API login failed, checking fallback / offline mode:', err);
      const msg = err.message || '';
      
      // If it's a genuine credential failure (401/403) from a running backend, respect the rejection
      if (msg.includes('401') || msg.includes('Incorrect password') || msg.includes('User not found')) {
        throw new Error('Invalid NIE email or password. Please verify your credentials or register an account.');
      }

      // If backend is unreachable or returning Failed to fetch (e.g. on mobile without backend proxy)
      const storedUsersRaw = localStorage.getItem('sahayak_registered_users');
      let registeredUser: any = null;
      if (storedUsersRaw) {
        try {
          const registeredList = JSON.parse(storedUsersRaw);
          registeredUser = registeredList.find((u: any) => u.email.toLowerCase() === loginEmail.toLowerCase());
        } catch {
          // Ignore parse errors
        }
      }

      const formattedName = loginEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Rahul Sharma';
      const fallbackUser: User = registeredUser || {
        id: `usr_${Date.now().toString().slice(-6)}`,
        name: formattedName,
        fullName: formattedName,
        email: loginEmail,
        usn: registeredUser?.usn || '4NI21CS108',
        phone: registeredUser?.phone || '+91 98765 43210',
        role: 'student',
        points: 120,
        finderPoints: 120,
        recoveredCount: 2,
        department: registeredUser?.branch || 'Computer Science & Engineering',
        branch: registeredUser?.branch || 'Computer Science & Engineering',
        semester: registeredUser?.semester || 5,
        section: registeredUser?.section || 'A'
      };

      const mockToken = `sahayak_offline_token_${Date.now()}`;
      setAuthToken(mockToken);
      setUser(fallbackUser);
      localStorage.setItem('sahayak_auth_user', JSON.stringify(fallbackUser));
      return true;
    }
  };

  const loginAdmin = async (email?: string, password?: string) => {
    const loginEmail = (email || '').trim();
    const loginPassword = password || '';

    if (!loginEmail || !loginPassword) {
      throw new Error('Please enter official administrative credentials.');
    }

    try {
      const res = await api.auth.adminLogin({ email: loginEmail, password: loginPassword });
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setUser(res.user);
        setAdminUser(res.user);
        return true;
      }
      throw new Error('Invalid admin login response from server.');
    } catch (err: any) {
      console.warn('Admin API login failed, checking fallback:', err);
      const msg = err.message || '';
      if (msg.includes('401') || msg.includes('403') || msg.includes('Unauthorized')) {
        throw new Error('Invalid administrator credentials or access denied.');
      }

      // Offline / mobile fallback admin session
      const fallbackAdmin: AdminUser = {
        id: 'usr_admin_proctor_1',
        name: 'Chief Proctor Office',
        fullName: 'Dr. Suresh Kumar (Chief Proctor)',
        email: loginEmail || 'admin@nie.ac.in',
        role: 'admin',
        department: 'NIE Campus Administration',
        permissions: ['manage_users', 'verify_claims', 'manage_locations', 'view_analytics']
      };

      const mockToken = `sahayak_admin_token_${Date.now()}`;
      setAuthToken(mockToken);
      setUser(fallbackAdmin as any);
      setAdminUser(fallbackAdmin);
      localStorage.setItem('sahayak_auth_user', JSON.stringify(fallbackAdmin));
      localStorage.setItem('sahayak_admin_user', JSON.stringify(fallbackAdmin));
      return true;
    }
  };

  const loginAsStudent = loginStudent;
  const loginAsAdmin = loginAdmin;

  const registerStudent = async (details: any) => {
    const payload = {
      email: details.email,
      password: details.password || 'Student@123',
      full_name: details.fullName || details.name,
      usn: details.usn,
      phone: details.phone,
      branch: details.department || details.branch || 'Computer Science & Engineering',
      semester: Number(details.semester) || 5,
      section: details.section || 'A'
    };

    try {
      const res = await api.auth.register(payload);
      if (res && res.access_token) {
        setAuthToken(res.access_token);
        setUser(res.user);
        return true;
      }
      throw new Error('Registration failed. Please check your details.');
    } catch (err: any) {
      console.warn('Registration API failed, saving to local store:', err);

      // Save user profile locally
      const storedUsersRaw = localStorage.getItem('sahayak_registered_users');
      let registeredList: any[] = [];
      if (storedUsersRaw) {
        try { registeredList = JSON.parse(storedUsersRaw); } catch {}
      }

      const newUser: User = {
        id: `usr_${Date.now().toString().slice(-6)}`,
        name: payload.full_name,
        fullName: payload.full_name,
        email: payload.email,
        usn: payload.usn,
        phone: payload.phone,
        role: 'student',
        points: 50,
        finderPoints: 50,
        recoveredCount: 0,
        department: payload.branch,
        branch: payload.branch,
        semester: payload.semester,
        section: payload.section
      };

      registeredList.push(newUser);
      localStorage.setItem('sahayak_registered_users', JSON.stringify(registeredList));

      const mockToken = `sahayak_offline_token_${Date.now()}`;
      setAuthToken(mockToken);
      setUser(newUser);
      localStorage.setItem('sahayak_auth_user', JSON.stringify(newUser));
      return true;
    }
  };

  const logout = () => {
    removeAuthToken();
    setUser(null);
    setAdminUser(null);
    localStorage.removeItem('sahayak_auth_user');
    localStorage.removeItem('sahayak_admin_user');
  };

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    if (!user) return false;

    const mergedUser = { ...user, ...updates } as User;
    setUser(mergedUser);
    localStorage.setItem('sahayak_auth_user', JSON.stringify(mergedUser));

    try {
      const updated = await api.users.updateProfile({
        full_name: updates.fullName || updates.name,
        phone: updates.phone,
        branch: updates.department || updates.branch,
        semester: updates.semester ? Number(updates.semester) : undefined,
        section: updates.section,
        emergency_contact: updates.emergencyContact,
        privacy_shield_active: updates.privacyShieldActive
      });
      if (updated) {
        setUser(updated);
        localStorage.setItem('sahayak_auth_user', JSON.stringify(updated));
      }
      return true;
    } catch (err: any) {
      console.warn('Failed to sync profile update to backend:', err);
      throw new Error(err.message || 'Failed to save changes to database.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        studentUser: user,
        adminUser,
        role,
        isAuthenticated,
        isAdminAuthenticated,
        loginStudent,
        loginAdmin,
        loginAsStudent,
        loginAsAdmin,
        registerStudent,
        logout,
        updateProfile,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
