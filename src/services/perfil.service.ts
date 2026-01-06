import { apiService } from './api.service';
import type { Perfil, ApiResponse } from '../types/api.types';

export interface PerfilCreateDto {
  clienteId: string;
  empresaId?: string;
  nome: string;
  permissoes: Record<string, string[]>;
}

export interface PerfilUpdateDto {
  nome?: string;
  permissoes?: Record<string, string[]>;
}

class PerfilService {
  async create(dto: PerfilCreateDto): Promise<Perfil> {
    const response: ApiResponse<Perfil> = await apiService.post('/perfis', dto);
    if (!response.data) {
      throw new Error('Erro ao criar perfil');
    }
    return response.data;
  }

  async findAll(clienteId: string): Promise<Perfil[]> {
    const response: ApiResponse<Perfil[]> = await apiService.get(`/perfis/${clienteId}`);
    return response.data || [];
  }

  async findOne(id: string, clienteId: string): Promise<Perfil> {
    const response: ApiResponse<Perfil> = await apiService.get(`/perfis/${clienteId}/${id}`);
    if (!response.data) {
      throw new Error('Perfil não encontrado');
    }
    return response.data;
  }

  async update(clienteId: string, id: string, dto: PerfilUpdateDto): Promise<Perfil> {
    const response: ApiResponse<Perfil> = await apiService.patch(`/perfis/${clienteId}/${id}`, dto);
    if (!response.data) {
      throw new Error('Erro ao atualizar perfil');
    }
    return response.data;
  }

  async remove(clienteId: string, id: string): Promise<void> {
    await apiService.delete(`/perfis/${clienteId}/${id}`);
  }
}

export const perfilService = new PerfilService();
