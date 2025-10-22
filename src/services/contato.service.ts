import { apiService } from './api.service';
import type { Contato, CreateContatoDto, UpdateContatoDto, ApiResponse } from '../types/api.types';

class ContatoService {
  async create(dto: CreateContatoDto): Promise<Contato> {
    const response: ApiResponse<Contato> = await apiService.post('/contatos', dto);
    return response.data!;
  }

  async findAll(): Promise<Contato[]> {
    const response: ApiResponse<Contato[]> = await apiService.get('/contatos');
    return response.data || [];
  }

  async findOne(id: string): Promise<Contato> {
    const response: ApiResponse<Contato> = await apiService.get(`/contatos/${id}`);
    return response.data!;
  }

  async findOneByTelefone(telefone: string): Promise<Contato> {
    const response: ApiResponse<Contato> = await apiService.get(`/contatos/telefone/${telefone}`);
    return response.data!;
  }

  async update(id: string, dto: UpdateContatoDto): Promise<Contato> {
    const response: ApiResponse<Contato> = await apiService.patch(`/contatos/${id}`, dto);
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/contatos/${id}`);
  }
}

export const contatoService = new ContatoService();
