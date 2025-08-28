import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { toast } from "react-hot-toast";

// API Client Configuration
class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;
  private authService: {
    getToken(): string | null;
    refreshToken(): Promise<unknown>;
    clearAuthData(): void;
    isAuthenticated(): boolean;
  } | null = null; // Will be injected to avoid circular dependency

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "https://51.20.12.21.nip.io";

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  // Inject auth service to avoid circular dependency
  setAuthService(authService: {
    getToken(): string | null;
    refreshToken(): Promise<unknown>;
    clearAuthData(): void;
    isAuthenticated(): boolean;
  }) {
    this.authService = authService;
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config) => {
        // Get token from auth service if available
        if (this.authService) {
          const token = this.authService.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized - token expired
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          this.authService
        ) {
          originalRequest._retry = true;

          // Try to refresh token using auth service
          try {
            await this.authService.refreshToken();

            // Get new token and retry original request
            const newToken = this.authService.getToken();
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - auth service will handle clearing tokens and redirect
            console.error("Token refresh failed:", refreshError);
            this.authService.clearAuthData();

            // Redirect to login if we're not already there
            if (
              typeof window !== "undefined" &&
              !window.location.pathname.includes("/login")
            ) {
              window.location.href = "/login";
            }
            return Promise.reject(refreshError);
          }
        }

        // Handle other errors
        this.handleApiError(error);
        return Promise.reject(error);
      }
    );
  }

  private handleApiError(error: unknown) {
    let message = "An error occurred";

    if (error && typeof error === "object" && "response" in error) {
      const response = (
        error as { response?: { data?: { message?: string }; status?: number } }
      ).response;
      message = response?.data?.message || message;

      // Don't show toast for 401 errors (handled above)
      if (response?.status !== 401) {
        toast.error(message);
      }
    } else if (error && typeof error === "object" && "message" in error) {
      message = (error as { message: string }).message;
      toast.error(message);
    }
  }

  // Generic HTTP methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);

    // Handle blob responses specially
    if (config?.responseType === "blob") {
      return response.data as T;
    }

    return response.data;
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Utility methods
  getBaseURL(): string {
    return this.baseURL;
  }

  // Check if user is authenticated (delegates to auth service)
  isAuthenticated(): boolean {
    return this.authService ? this.authService.isAuthenticated() : false;
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Initialize auth service injection (done after both are created)
if (typeof window !== "undefined") {
  // Dynamically import and inject auth service to avoid circular dependency
  import("../services/AuthService").then(({ authService }) => {
    apiClient.setAuthService(authService);
  });
}

// Export types for convenience
export type { AxiosRequestConfig, AxiosResponse };
