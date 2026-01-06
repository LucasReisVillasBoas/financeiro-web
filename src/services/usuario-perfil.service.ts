import { apiService } from './api.service';
import type { ApiResponse } from '../types/api.types';

export interface UsuarioPerfil {
  id: string;
  usuario: { id: string };
  empresa: { id: string };
  perfil: { id: string };
  ativo: boolean;
}

export interface UsuarioPerfilDetalhado {
  id: string;
  ativo: boolean;
  usuario: {
    id: string;
    nome: string;
    login: string;
    ativo: boolean;
  };
  empresas: Array<{
    id: string;
    nome_fantasia: string;
    razao_social: string;
    isFilial: boolean;
  }>;
  perfil: {
    id: string;
    nome: string;
    masterAdmin?: boolean;
  };
}

export interface CreateUsuarioPerfilDto {
  usuarioId: string;
  empresaId: string;
  perfilId: string;
}

class UsuarioPerfilService {
  async create(dto: CreateUsuarioPerfilDto): Promise<UsuarioPerfil> {
    const response: ApiResponse<UsuarioPerfil> = await apiService.post('/usuario-perfil', dto);
    if (!response.data) {
      throw new Error('Erro ao criar associação de usuário-perfil');
    }
    return response.data;
  }

  async findByUsuario(usuarioId: string): Promise<UsuarioPerfil[]> {
    const response: ApiResponse<UsuarioPerfil[]> = await apiService.get(
      `/usuario-perfil/usuario/${usuarioId}`
    );
    return response.data || [];
  }

  async findByCliente(clienteId: string): Promise<UsuarioPerfilDetalhado[]> {
    const response: ApiResponse<UsuarioPerfilDetalhado[]> = await apiService.get(
      `/usuario-perfil/cliente/${clienteId}`
    );
    return response.data || [];
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/usuario-perfil/${id}`);
  }
}

export const usuarioPerfilService = new UsuarioPerfilService();
