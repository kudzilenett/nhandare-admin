"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, LoginResponse } from "@/services/AuthService";
import { AdminUser, AdminRole } from "@/types/admin";

// Helper function to map AuthService user to AdminUser
const mapToAdminUser = (userData: LoginResponse["user"]): AdminUser => ({
  id: userData.id,
  email: userData.email,
  name: `${userData.firstName} ${userData.lastName}`,
  role: userData.role as AdminRole,
  permissions: userData.permissions,
  lastLogin: userData.lastLogin ? new Date(userData.lastLogin) : new Date(),
  isActive: userData.isActive,
  createdAt: new Date(userData.createdAt),
  updatedAt: new Date(), // Use current date as updatedAt
});

interface AuthContextType {
  user: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Check authentication status on mount and start auto-refresh
  useEffect(() => {
    checkAuth();
    authService.startAutoRefresh();

    // Cleanup on unmount
    return () => {
      authService.stopAutoRefresh();
    };
  }, []);

  const checkAuth = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(mapToAdminUser(userData));
      }
    } catch (error) {
      // User is not authenticated or token is invalid
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await authService.login({ email, password });
      setUser(mapToAdminUser(authData.user));
    } catch (error) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(mapToAdminUser(userData));
      }
    } catch (error) {
      setUser(null);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
