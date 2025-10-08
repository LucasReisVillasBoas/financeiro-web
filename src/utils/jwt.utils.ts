interface JwtPayload {
  sub?: string;
  email?: string;
  clienteId?: string;
  cliente?: string;
  [key: string]: any;
}

export function decodeJWT(token: string): JwtPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return null;
  }
}

export function getClienteIdFromToken(token: string | null): string | null {
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  // Tenta diferentes chaves comuns para cliente_id
  return (
    payload.clienteId ||
    payload.cliente ||
    payload.cliente_id ||
    payload.sub ||
    null
  );
}

export function getUserDataFromToken(token: string | null): {
  id: string | null;
  email: string | null;
  clienteId: string | null;
  name?: string;
} | null {
  if (!token) return null;

  const payload = decodeJWT(token);
  if (!payload) return null;

  return {
    id: payload.sub || payload.id || null,
    email: payload.email || null,
    clienteId: getClienteIdFromToken(token),
    name: payload.name || payload.nome || undefined,
  };
}
