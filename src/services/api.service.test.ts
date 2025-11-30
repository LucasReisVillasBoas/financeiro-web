import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from './api.service';
import { server } from '../tests/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3002';

describe('apiService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('request com autenticação', () => {
    it('deve adicionar token de autorização quando disponível', async () => {
      const token = 'test-token-123';
      localStorage.setItem('token', token);

      let capturedHeaders: Headers | undefined;
      server.use(
        http.get(`${API_BASE_URL}/test-auth`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({
            message: 'Success',
            statusCode: 200,
            data: { authenticated: true },
          });
        })
      );

      await apiService.get('/test-auth');

      expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('deve fazer requisição sem token quando não autenticado', async () => {
      let capturedHeaders: Headers | undefined;
      server.use(
        http.get(`${API_BASE_URL}/test-no-auth`, ({ request }) => {
          capturedHeaders = request.headers;
          return HttpResponse.json({
            message: 'Success',
            statusCode: 200,
            data: {},
          });
        })
      );

      await apiService.get('/test-no-auth');

      expect(capturedHeaders?.get('Authorization')).toBeNull();
    });
  });

  describe('GET', () => {
    it('deve fazer requisição GET com sucesso', async () => {
      const mockData = { id: 1, name: 'Test' };
      server.use(
        http.get(`${API_BASE_URL}/test-get`, () => {
          return HttpResponse.json({
            message: 'Success',
            statusCode: 200,
            data: mockData,
          });
        })
      );

      const response = await apiService.get<typeof mockData>('/test-get');

      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual(mockData);
    });

    it('deve lançar erro para resposta não-ok', async () => {
      server.use(
        http.get(`${API_BASE_URL}/test-error`, () => {
          return HttpResponse.json({ message: 'Not Found', statusCode: 404 }, { status: 404 });
        })
      );

      await expect(apiService.get('/test-error')).rejects.toThrow('Not Found');
    });

    it('deve tratar erro quando resposta não é JSON válido', async () => {
      server.use(
        http.get(`${API_BASE_URL}/test-invalid-json`, () => {
          return new HttpResponse('Invalid', { status: 500 });
        })
      );

      await expect(apiService.get('/test-invalid-json')).rejects.toThrow(
        'Erro ao processar requisição'
      );
    });
  });

  describe('POST', () => {
    it('deve fazer requisição POST com dados', async () => {
      const requestData = { name: 'New Item' };
      const responseData = { id: 1, ...requestData };

      let capturedBody: any;
      server.use(
        http.post(`${API_BASE_URL}/test-post`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            message: 'Created',
            statusCode: 201,
            data: responseData,
          });
        })
      );

      const response = await apiService.post<typeof responseData>('/test-post', requestData);

      expect(capturedBody).toEqual(requestData);
      expect(response.statusCode).toBe(201);
      expect(response.data).toEqual(responseData);
    });

    it('deve fazer requisição POST sem dados', async () => {
      server.use(
        http.post(`${API_BASE_URL}/test-post-empty`, () => {
          return HttpResponse.json({
            message: 'Success',
            statusCode: 200,
          });
        })
      );

      const response = await apiService.post('/test-post-empty');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('PUT', () => {
    it('deve fazer requisição PUT com dados', async () => {
      const updateData = { name: 'Updated Item' };
      const responseData = { id: 1, ...updateData };

      let capturedBody: any;
      server.use(
        http.put(`${API_BASE_URL}/test-put/1`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            message: 'Updated',
            statusCode: 200,
            data: responseData,
          });
        })
      );

      const response = await apiService.put<typeof responseData>('/test-put/1', updateData);

      expect(capturedBody).toEqual(updateData);
      expect(response.data).toEqual(responseData);
    });
  });

  describe('PATCH', () => {
    it('deve fazer requisição PATCH com dados parciais', async () => {
      const patchData = { status: 'active' };

      let capturedBody: any;
      server.use(
        http.patch(`${API_BASE_URL}/test-patch/1`, async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json({
            message: 'Patched',
            statusCode: 200,
            data: { id: 1, ...patchData },
          });
        })
      );

      const response = await apiService.patch('/test-patch/1', patchData);

      expect(capturedBody).toEqual(patchData);
      expect(response.statusCode).toBe(200);
    });
  });

  describe('DELETE', () => {
    it('deve fazer requisição DELETE com sucesso', async () => {
      server.use(
        http.delete(`${API_BASE_URL}/test-delete/1`, () => {
          return HttpResponse.json({
            message: 'Deleted',
            statusCode: 200,
          });
        })
      );

      const response = await apiService.delete('/test-delete/1');

      expect(response.message).toBe('Deleted');
      expect(response.statusCode).toBe(200);
    });
  });

  describe('getBlob', () => {
    it('deve fazer download de arquivo como blob', async () => {
      const blobContent = 'file content';
      localStorage.setItem('token', 'test-token');

      server.use(
        http.get(`${API_BASE_URL}/test-blob`, () => {
          return new HttpResponse(blobContent, {
            headers: {
              'Content-Type': 'application/octet-stream',
            },
          });
        })
      );

      const blob = await apiService.getBlob('/test-blob');

      // Em jsdom, Blob pode não ser a mesma classe, então verificamos propriedades
      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
      expect(typeof blob.text).toBe('function');
    });

    it('deve adicionar token de autorização no getBlob', async () => {
      const token = 'test-token';
      localStorage.setItem('token', token);

      let capturedHeaders: Headers | undefined;
      server.use(
        http.get(`${API_BASE_URL}/test-blob-auth`, ({ request }) => {
          capturedHeaders = request.headers;
          return new HttpResponse('content', {
            headers: { 'Content-Type': 'application/octet-stream' },
          });
        })
      );

      await apiService.getBlob('/test-blob-auth');

      expect(capturedHeaders?.get('Authorization')).toBe(`Bearer ${token}`);
    });

    it('deve lançar erro para resposta não-ok no getBlob', async () => {
      server.use(
        http.get(`${API_BASE_URL}/test-blob-error`, () => {
          return HttpResponse.json({ message: 'File not found' }, { status: 404 });
        })
      );

      await expect(apiService.getBlob('/test-blob-error')).rejects.toThrow('File not found');
    });
  });

  describe('tratamento de erros', () => {
    it('deve extrair mensagem de erro da resposta', async () => {
      server.use(
        http.get(`${API_BASE_URL}/test-error-message`, () => {
          return HttpResponse.json({ message: 'Erro específico da API' }, { status: 400 });
        })
      );

      try {
        await apiService.get('/test-error-message');
        expect.fail('Deveria ter lançado erro');
      } catch (error: any) {
        expect(error.message).toBe('Erro específico da API');
        expect(error.statusCode).toBe(400);
      }
    });

    it('deve usar campo error quando message não existe', async () => {
      server.use(
        http.get(`${API_BASE_URL}/test-error-field`, () => {
          return HttpResponse.json({ error: 'Erro via campo error' }, { status: 400 });
        })
      );

      await expect(apiService.get('/test-error-field')).rejects.toThrow('Erro via campo error');
    });

    it('deve incluir detalhes do erro', async () => {
      const errorDetails = { field: 'email', reason: 'invalid' };
      server.use(
        http.get(`${API_BASE_URL}/test-error-details`, () => {
          return HttpResponse.json(
            { message: 'Validation error', ...errorDetails },
            { status: 422 }
          );
        })
      );

      try {
        await apiService.get('/test-error-details');
        expect.fail('Deveria ter lançado erro');
      } catch (error: any) {
        expect(error.details).toBeDefined();
        expect(error.details.field).toBe('email');
      }
    });
  });
});
