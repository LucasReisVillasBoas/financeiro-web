import { apiService } from './api.service';
import { LoginRequest, LoginResponse, ApiResponse } from '../types/api.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: ApiResponse<LoginResponse> = await apiService.post(
      '/auth/login',
      credentials
    );

    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }

    return response.data!;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
