const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

interface ApiResponse<T = any> {
  message: string;
  statusCode: number;
  data?: T;
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
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

      // Extrai a mensagem de erro da resposta da API
      const errorMessage = error.message || error.error || 'Erro na requisição';

      const apiError: any = new Error(errorMessage);
      apiError.statusCode = response.status;
      apiError.details = error;
      throw apiError;
    }

    return response.json();
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
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

      const errorMessage = error.message || error.error || 'Erro na requisição';
      const apiError: any = new Error(errorMessage);
      apiError.statusCode = response.status;
      apiError.details = error;
      throw apiError;
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

      const errorMessage = error.message || error.error || 'Erro na requisição';
      const apiError: any = new Error(errorMessage);
      apiError.statusCode = response.status;
      apiError.details = error;
      throw apiError;
    }

    return response.blob();
  }
}

export const apiService = new ApiService();
