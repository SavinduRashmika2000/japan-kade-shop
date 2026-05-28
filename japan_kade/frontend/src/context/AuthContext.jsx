import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    setUser(data);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const signup = async (userData) => {
    return await authService.signup(userData);
  };

  const verifyRecovery = async (phone, idNo) => {
    return await authService.verifyRecovery(phone, idNo);
  };

  const resetPassword = async (phone, idNo, newPassword) => {
    return await authService.resetPassword(phone, idNo, newPassword);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, verifyRecovery, resetPassword, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
