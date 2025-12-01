import { apiService } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface UsuarioPerfil {
  id: string;
  usuario: { id: string };
  empresa: { id: string };
  perfil: { id: string };
  ativo: boolean;
}

export interface CreateUsuarioPerfilDto {
  usuarioId: string;
  empresaId: string;
  perfilId: string;
}

class UsuarioPerfilService {
  async create(dto: CreateUsuarioPerfilDto): Promise<UsuarioPerfil> {
    const response: ApiResponse<UsuarioPerfil> = await apiService.post('/usuario-perfil', dto);
    return response.data!;
  }

  async findByUsuario(usuarioId: string): Promise<UsuarioPerfil[]> {
    const response: ApiResponse<UsuarioPerfil[]> = await apiService.get(
      `/usuario-perfil/usuario/${usuarioId}`
    );
    return response.data || [];
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/usuario-perfil/${id}`);
  }
}

export const usuarioPerfilService = new UsuarioPerfilService();
