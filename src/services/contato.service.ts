import { apiService } from './api.service';
import {
  Contato,
  CreateContatoDto,
  UpdateContatoDto,
  ApiResponse,
} from '../types/api.types';

class ContatoService {
  async create(dto: CreateContatoDto): Promise<Contato> {
    const response: ApiResponse<Contato> = await apiService.post(
      '/contatos',
      dto
    );
    return response.data!;
  }

  async findAll(): Promise<Contato[]> {
    const response: ApiResponse<Contato[]> = await apiService.get('/contatos');
    return response.data || [];
  }

  async findOne(id: string, empresaId: string): Promise<Contato> {
    const response: ApiResponse<Contato> = await apiService.get(
      `/contatos/${id}/${empresaId}`
    );
    return response.data!;
  }

  async update(
    id: string,
    empresaId: string,
    dto: UpdateContatoDto
  ): Promise<Contato> {
    const response: ApiResponse<Contato> = await apiService.patch(
      `/contatos/${id}/${empresaId}`,
      dto
    );
    return response.data!;
  }

  async delete(id: string, empresaId: string): Promise<void> {
    await apiService.delete(`/contatos/${id}/${empresaId}`);
  }
}

export const contatoService = new ContatoService();
