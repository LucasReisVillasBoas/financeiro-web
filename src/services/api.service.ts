const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface ApiResponse<T = unknown> {
  message: string;
  statusCode: number;
  data?: T;
}

interface ApiError extends Error {
  statusCode: number;
  details: unknown;
}

function createApiError(message: string, statusCode: number, details: unknown): ApiError {
  const error = new Error(message) as ApiError;
  error.statusCode = statusCode;
  error.details = details;
  return error;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('permissoes');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Erro ao processar requisição',
      }));

      // Tratamento especial para erro 401 (Unauthorized) - token expirado/inválido
      if (response.status === 401) {
        this.clearAuthData();
        window.location.href = '/login';
        throw createApiError('Sessão expirada. Faça login novamente.', 401, error);
      }

      // Tratamento especial para erro 403 (Forbidden)
      if (response.status === 403) {
        throw createApiError(
          'Seu perfil não tem permissão para realizar essa ação. Entre em contato com um administrador.',
          403,
          error
        );
      }

      // Extrai a mensagem de erro da resposta da API
      const errorMessage = error.message || error.error || 'Erro na requisição';
      throw createApiError(errorMessage, response.status, error);
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async postFormData<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Erro ao processar requisição',
      }));

      // Tratamento especial para erro 401 (Unauthorized) - token expirado/inválido
      if (response.status === 401) {
        this.clearAuthData();
        window.location.href = '/login';
        throw createApiError('Sessão expirada. Faça login novamente.', 401, error);
      }

      // Tratamento especial para erro 403 (Forbidden)
      if (response.status === 403) {
        throw createApiError(
          'Seu perfil não tem permissão para realizar essa ação. Entre em contato com um administrador.',
          403,
          error
        );
      }

      const errorMessage = error.message || error.error || 'Erro na requisição';
      throw createApiError(errorMessage, response.status, error);
    }

    return response.json();
  }

  async getBlob(endpoint: string): Promise<Blob> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Erro ao processar requisição',
      }));

      // Tratamento especial para erro 401 (Unauthorized) - token expirado/inválido
      if (response.status === 401) {
        this.clearAuthData();
        window.location.href = '/login';
        throw createApiError('Sessão expirada. Faça login novamente.', 401, error);
      }

      // Tratamento especial para erro 403 (Forbidden)
      if (response.status === 403) {
        throw createApiError(
          'Seu perfil não tem permissão para realizar essa ação. Entre em contato com um administrador.',
          403,
          error
        );
      }

      const errorMessage = error.message || error.error || 'Erro na requisição';
      throw createApiError(errorMessage, response.status, error);
    }

    return response.blob();
  }
}

export const apiService = new ApiService();
