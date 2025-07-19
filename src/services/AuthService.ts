import { apiClient } from "@/lib/api-client";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    role: "user" | "admin" | "moderator" | "super_admin";
    permissions: string[];
    isActive: boolean;
    isVerified: boolean;
    lastLogin: string | null;
    createdAt: string;
    // Additional fields from backend
    phoneNumber?: string;
    province?: string;
    city?: string;
    institution?: string;
    isStudent?: boolean;
    location?: string;
    points: number;
    rank?: number;
  };
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
}

class AuthService {
  private readonly TOKEN_KEY = "admin_token";
  private readonly REFRESH_TOKEN_KEY = "admin_refresh_token";
  private readonly USER_KEY = "admin_user";

  // Token management
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  getUser(): LoginResponse["user"] | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  setAuthData(authData: LoginResponse): void {
    if (typeof window === "undefined") return;

    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authData.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
  }

  clearAuthData(): void {
    if (typeof window === "undefined") return;

    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  shouldRefreshToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      const timeUntilExpiry = payload.exp - currentTime;

      // Refresh if token expires in less than 5 minutes
      return timeUntilExpiry < 300;
    } catch (error) {
      return false;
    }
  }

  hasRole(requiredRole: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    const roleHierarchy = {
      super_admin: 4,
      admin: 3,
      moderator: 2,
      user: 1,
    };

    const userRoleLevel =
      roleHierarchy[user.role as keyof typeof roleHierarchy] || 0;
    const requiredRoleLevel =
      roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  hasPermission(permission: string): boolean {
    const user = this.getUser();
    return user?.permissions?.includes(permission) || false;
  }

  // Authentication API calls
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: LoginResponse;
      }>("/api/auth/admin/login", credentials);

      const loginData = response.data;
      this.setAuthData(loginData);
      return loginData;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      const token = this.getToken();
      if (token) {
        // Call admin logout endpoint to invalidate token on server
        await apiClient.post(
          "/api/auth/admin/logout",
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch (error) {
      // Log error but don't throw - we want to clear local data regardless
      console.error("Error during logout API call:", error);
    } finally {
      this.clearAuthData();
    }
  }

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const response = await apiClient.post<{
        success: boolean;
        message: string;
        data: {
          token: string;
          refreshToken: string;
        };
      }>("/api/auth/admin/refresh", {
        refreshToken,
      });

      const authData = {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        user: this.getUser()!, // Keep existing user data, just update tokens
      };

      this.setAuthData(authData);
      return authData;
    } catch (error) {
      // If refresh fails, clear auth data
      this.clearAuthData();
      throw error;
    }
  }

  async getCurrentUser(): Promise<LoginResponse["user"]> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          user: LoginResponse["user"];
        };
      }>("/api/auth/admin/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data.user;

      // Update stored user data
      if (typeof window !== "undefined") {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      }

      return user;
    } catch (error) {
      // If user fetch fails, clear auth data
      this.clearAuthData();
      throw error;
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post("/api/auth/forgot-password", { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/api/auth/reset-password", {
      token,
      password: newPassword,
    });
  }

  async changePassword(data: ChangePasswordRequest): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    await apiClient.post("/api/auth/change-password", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async updateProfile(
    data: UpdateProfileRequest
  ): Promise<LoginResponse["user"]> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    try {
      const updatedUser = await apiClient.put<LoginResponse["user"]>(
        "/api/auth/profile",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update stored user data
      if (typeof window !== "undefined") {
        localStorage.setItem(this.USER_KEY, JSON.stringify(updatedUser));
      }

      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  async verifyEmail(token: string): Promise<void> {
    await apiClient.post("/api/auth/verify-email", { token });
  }

  async resendEmailVerification(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    await apiClient.post(
      "/api/auth/resend-verification",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  }

  // Session management
  async validateSession(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    // Check if token is expired
    if (this.isTokenExpired(token)) {
      // Try to refresh token
      try {
        await this.refreshToken();
        return true;
      } catch (error) {
        this.clearAuthData();
        return false;
      }
    }

    // Check if we should refresh token proactively
    if (this.shouldRefreshToken()) {
      try {
        await this.refreshToken();
      } catch (error) {
        // If refresh fails, session is still valid for now
        console.warn("Token refresh failed:", error);
      }
    }

    return true;
  }

  // Auto-refresh setup
  private refreshInterval?: NodeJS.Timeout;

  startAutoRefresh(): void {
    this.stopAutoRefresh();

    // Check every minute
    this.refreshInterval = setInterval(async () => {
      if (this.isAuthenticated() && this.shouldRefreshToken()) {
        try {
          await this.refreshToken();
        } catch (error) {
          console.error("Auto-refresh failed:", error);
          this.clearAuthData();
        }
      }
    }, 60000); // 1 minute
  }

  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = undefined;
    }
  }

  // Admin-specific methods
  async getAdminStats(): Promise<{
    totalUsers: number;
    activeSessions: number;
    recentLogins: number;
    failedAttempts: number;
  }> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    const response = await apiClient.get<{
      success: boolean;
      data: {
        totalUsers: number;
        activeSessions: number;
        recentLogins: number;
        failedAttempts: number;
      };
    }>("/api/auth/admin/stats", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getSessionHistory(
    page = 1,
    limit = 20
  ): Promise<{
    sessions: Array<{
      id: string;
      ipAddress: string;
      userAgent: string;
      loginAt: string;
      logoutAt?: string;
      isActive: boolean;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    return apiClient.get(`/api/auth/sessions?page=${page}&limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async revokeSession(sessionId: string): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    await apiClient.delete(`/api/auth/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  async revokeAllSessions(): Promise<void> {
    const token = this.getToken();
    if (!token) {
      throw new Error("No authentication token");
    }

    await apiClient.delete("/api/auth/sessions", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Clear current session as well
    this.clearAuthData();
  }
}

export const authService = new AuthService();
