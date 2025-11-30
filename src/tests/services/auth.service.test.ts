import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../services/auth.service';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { mockToken } from '../mocks/handlers';

const API_BASE_URL = 'http://localhost:3002';

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com sucesso e salvar token', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await authService.login(credentials);

      expect(response.token).toBe(mockToken);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('deve lançar erro para credenciais inválidas', async () => {
      const credentials = {
        email: 'wrong@example.com',
        password: 'wrongpassword',
      };

      await expect(authService.login(credentials)).rejects.toThrow('Credenciais inválidas');
    });

    it('deve extrair token do campo data quando presente', async () => {
      server.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.json({
            message: 'Success',
            statusCode: 200,
            data: { token: 'data-token-123' },
          });
        })
      );

      const response = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.token).toBe('data-token-123');
      expect(localStorage.getItem('token')).toBe('data-token-123');
    });

    it('deve lidar com resposta sem token', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      server.use(
        http.post(`${API_BASE_URL}/auth/login`, () => {
          return HttpResponse.json({
            message: 'Success',
            statusCode: 200,
            data: {},
          });
        })
      );

      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(consoleSpy).toHaveBeenCalledWith('Nenhum token recebido da API');
      expect(localStorage.getItem('token')).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('deve fazer logout e limpar localStorage', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', name: 'Test' }));

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('deve limpar localStorage mesmo se logout no servidor falhar', async () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: '1' }));

      server.use(
        http.post(`${API_BASE_URL}/auth/logout`, () => {
          return HttpResponse.json({ message: 'Error' }, { status: 500 });
        })
      );

      await authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('getToken', () => {
    it('deve retornar token quando existe', () => {
      localStorage.setItem('token', 'stored-token');

      const token = authService.getToken();

      expect(token).toBe('stored-token');
    });

    it('deve retornar null quando não há token', () => {
      const token = authService.getToken();

      expect(token).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando há token', () => {
      localStorage.setItem('token', 'valid-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('deve retornar false quando não há token', () => {
      expect(authService.isAuthenticated()).toBe(false);
    });

    it('deve retornar false quando token é vazio', () => {
      localStorage.setItem('token', '');

      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});
