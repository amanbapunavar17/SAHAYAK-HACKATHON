import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, StudentProfile, AdminUser, UserRole } from '../types';
import { mockCurrentUser, mockAdminUser } from './mockData';

interface AuthContextType {
  user: User | null;
  studentUser: User | null;
  adminUser: AdminUser | null;
  role: UserRole | string;
  isAuthenticated: boolean;
  isAdminAuthenticated: boolean;
  loginStudent: (email?: string, password?: string) => Promise<boolean>;
  loginAdmin: (email?: string, pin?: string) => Promise<boolean>;
  loginAsStudent: (email?: string, usn?: string) => Promise<boolean>;
  loginAsAdmin: (email?: string, pin?: string) => Promise<boolean>;
  registerStudent: (details: Partial<StudentProfile> | any) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<StudentProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('sahayak_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockCurrentUser;
      }
    }
    return mockCurrentUser;
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('sahayak_admin_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return mockAdminUser;
      }
    }
    return mockAdminUser;
  });

  const role = user?.role || 'student';
  const isAuthenticated = !!user;
  const isAdminAuthenticated = !!adminUser;

  useEffect(() => {
    if (user) {
      localStorage.setItem('sahayak_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sahayak_auth_user');
    }
  }, [user]);

  const loginStudent = async (_email?: string, _password?: string) => {
    setUser(mockCurrentUser);
    return true;
  };

  const loginAdmin = async (_email?: string, _pin?: string) => {
    setAdminUser(mockAdminUser);
    return true;
  };

  const loginAsStudent = loginStudent;
  const loginAsAdmin = loginAdmin;

  const registerStudent = async (details: Partial<StudentProfile> | any) => {
    const newUser: User = {
      ...mockCurrentUser,
      ...details,
      id: `usr_${Date.now()}`
    };
    setUser(newUser);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const updateProfile = (updates: Partial<StudentProfile>) => {
    if (user) {
      setUser({ ...user, ...updates } as User);
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
        updateProfile
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
