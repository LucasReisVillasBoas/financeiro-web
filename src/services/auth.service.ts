import { apiService } from './api.service';
import type { LoginRequest, LoginResponse, ApiResponse } from '../types/api.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: ApiResponse<LoginResponse> = await apiService.post('/auth/login', credentials);

    const token = (response as any).token || response.data?.token;

    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.log('Nenhum token recebido da API');
    }

    return (response as any).token ? (response as any) : response.data!;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao registrar logout no servidor:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
