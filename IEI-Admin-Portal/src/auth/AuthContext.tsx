import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { hasPermission } from '../permissions/roles';
import type { AdminUser, LoginCredentials } from '../types/auth.types';
import type { AdminPermission } from '../types/permissions.types';

export interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<AdminUser>;
  logout: () => void;
  checkPermission: (permission: AdminPermission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session on mount
    try {
      const stored = authService.getStoredSession();
      if (stored && stored.accessToken) {
        setUser(stored);
      }
    } catch (e) {
      console.error('Failed to restore admin session:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<AdminUser> => {
    setIsLoading(true);
    try {
      const authenticatedUser = await authService.login(credentials);
      setUser(authenticatedUser);
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const checkPermission = (permission: AdminPermission): boolean => {
    return hasPermission(user, permission);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: user?.accessToken || null,
        isAuthenticated: Boolean(user && user.accessToken),
        isLoading,
        login,
        logout,
        checkPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
