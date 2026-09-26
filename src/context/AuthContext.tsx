import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { storage } from '../lib/storage';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (profileData: Partial<User['profile']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    storage.init(); // Initialize storage with dummy data if empty
    const savedUserId = localStorage.getItem('currentUser');
    if (savedUserId) {
      const foundUser = storage.getUserById(savedUserId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem('currentUser', userData.id);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (profileData: Partial<User['profile']>) => {
    if (user) {
      const updatedUser = { ...user, profile: { ...user.profile, ...profileData } };
      setUser(updatedUser);
      storage.saveUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile }}>
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
