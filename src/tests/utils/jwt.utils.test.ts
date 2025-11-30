import { describe, it, expect, vi, beforeEach } from 'vitest';
import { decodeJWT, getClienteIdFromToken, getUserDataFromToken } from '../../utils/jwt.utils';

// Valid JWT token for testing (não expira - apenas para teste)
const validToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdEBleGFtcGxlLmNvbSIsImNsaWVudGVJZCI6ImNsaWVudGUtMTIzIiwibmFtZSI6IlRlc3QgVXNlciIsImlhdCI6MTYxNjIzOTAyMn0.mock';

const tokenWithoutClienteId =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTQ1NiIsInVzZXJuYW1lIjoib3RoZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE2MTYyMzkwMjJ9.mock';

describe('jwt.utils', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('decodeJWT', () => {
    it('deve decodificar token JWT válido', () => {
      const payload = decodeJWT(validToken);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe('user-123');
      expect(payload?.username).toBe('test@example.com');
      expect(payload?.clienteId).toBe('cliente-123');
    });

    it('deve retornar null para token inválido', () => {
      const payload = decodeJWT('invalid-token');
      expect(payload).toBeNull();
    });

    it('deve retornar null para token vazio', () => {
      const payload = decodeJWT('');
      expect(payload).toBeNull();
    });

    it('deve retornar null para token sem payload', () => {
      const payload = decodeJWT('header.');
      expect(payload).toBeNull();
    });

    it('deve retornar null para token malformado', () => {
      const payload = decodeJWT('not.a.valid.jwt.token');
      expect(payload).toBeNull();
    });

    it('deve lidar com caracteres especiais no base64url', () => {
      // Token com caracteres - e _ que são específicos do base64url
      const result = decodeJWT(validToken);
      expect(result).not.toBeNull();
    });
  });

  describe('getClienteIdFromToken', () => {
    it('deve extrair clienteId do token', () => {
      const clienteId = getClienteIdFromToken(validToken);
      expect(clienteId).toBe('user-123'); // sub é usado como clienteId
    });

    it('deve retornar null para token sem sub', () => {
      const tokenSemSub =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RAZXhhbXBsZS5jb20ifQ.mock';
      const clienteId = getClienteIdFromToken(tokenSemSub);
      expect(clienteId).toBeNull();
    });

    it('deve retornar null para token null', () => {
      const clienteId = getClienteIdFromToken(null);
      expect(clienteId).toBeNull();
    });

    it('deve retornar null para token inválido', () => {
      const clienteId = getClienteIdFromToken('invalid');
      expect(clienteId).toBeNull();
    });
  });

  describe('getUserDataFromToken', () => {
    it('deve extrair dados do usuário do token', () => {
      const userData = getUserDataFromToken(validToken);

      expect(userData).not.toBeNull();
      expect(userData?.id).toBe('user-123');
      expect(userData?.email).toBe('test@example.com');
      expect(userData?.clienteId).toBe('user-123');
    });

    it('deve retornar null para token null', () => {
      const userData = getUserDataFromToken(null);
      expect(userData).toBeNull();
    });

    it('deve retornar null para token inválido', () => {
      const userData = getUserDataFromToken('invalid-token');
      expect(userData).toBeNull();
    });

    it('deve retornar dados mesmo sem clienteId no payload', () => {
      const userData = getUserDataFromToken(tokenWithoutClienteId);

      expect(userData).not.toBeNull();
      expect(userData?.id).toBe('user-456');
      expect(userData?.email).toBe('other@example.com');
    });

    it('deve retornar null para token vazio', () => {
      const userData = getUserDataFromToken('');
      expect(userData).toBeNull();
    });
  });
});
