import type { ApiResponse, CreatePessoaDto, Pessoa, UpdatePessoaDto } from '../types/api.types';
import { apiService } from './api.service';

export const pessoaService = {
  async findAll(): Promise<Pessoa[]> {
    const response: ApiResponse<Pessoa[]> = await apiService.get<Pessoa[]>('/pessoas');
    return response.data || [];
  },

  async findByCliente(clienteId: string): Promise<Pessoa[]> {
    const response: ApiResponse<Pessoa[]> = await apiService.get<Pessoa[]>(
      `/pessoas/cliente/${clienteId}`
    );
    return response.data || [];
  },

  async findById(id: string): Promise<Pessoa> {
    const response: ApiResponse<Pessoa> = await apiService.get<Pessoa>(`/pessoas/${id}`);
    if (!response.data) {
      throw new Error('Pessoa não encontrada');
    }
    return response.data;
  },

  async create(dto: CreatePessoaDto): Promise<Pessoa> {
    const response: ApiResponse<Pessoa> = await apiService.post('/pessoas/completo', dto);
    if (!response.data) {
      throw new Error('Erro ao criar pessoa');
    }
    return response.data;
  },

  async update(id: string, data: UpdatePessoaDto): Promise<Pessoa> {
    const response: ApiResponse<Pessoa> = await apiService.put<Pessoa>(`/pessoas/${id}`, data);
    if (!response.data) {
      throw new Error('Erro ao atualizar pessoa');
    }
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiService.delete(`/pessoas/${id}`);
  },

  async findAtivas(clienteId: string): Promise<Pessoa[]> {
    const response: ApiResponse<Pessoa[]> = await apiService.get<Pessoa[]>(
      `/pessoas/cliente/${clienteId}/ativas`
    );
    return response.data || [];
  },
};
