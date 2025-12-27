import { apiService } from './api.service';
import type { LoginRequest, LoginResponse, ApiResponse, Permissoes } from '../types/api.types';

class AuthService {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response: ApiResponse<LoginResponse> = await apiService.post('/auth/login', credentials);

    const result = (response as any).token ? (response as any) : response.data!;
    const token = result.token;
    const permissoes = result.permissoes;

    if (token) {
      localStorage.setItem('token', token);
    } else {
      console.log('Nenhum token recebido da API');
    }

    if (permissoes) {
      localStorage.setItem('permissoes', JSON.stringify(permissoes));
    }

    return result;
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.error('Erro ao registrar logout no servidor:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('permissoes');
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getPermissoes(): Permissoes | null {
    const permissoes = localStorage.getItem('permissoes');
    return permissoes ? JSON.parse(permissoes) : null;
  }

  /**
   * Verifica se o usuário tem acesso a um módulo específico
   */
  hasModuleAccess(module: string): boolean {
    const permissoes = this.getPermissoes();
    if (!permissoes) return false;
    return (
      module in permissoes && Array.isArray(permissoes[module]) && permissoes[module].length > 0
    );
  }

  /**
   * Verifica se o usuário tem uma permissão específica
   */
  hasPermission(module: string, action: string): boolean {
    const permissoes = this.getPermissoes();
    if (!permissoes) return false;
    const modulePermissions = permissoes[module];
    if (!modulePermissions || !Array.isArray(modulePermissions)) return false;
    return modulePermissions.includes(action);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();
