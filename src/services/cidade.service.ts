import { apiService } from './api.service';
import type { Cidade, CreateCidadeDto, UpdateCidadeDto, ApiResponse } from '../types/api.types';

class CidadeService {
  async create(dto: CreateCidadeDto): Promise<Cidade> {
    const response: ApiResponse<Cidade> = await apiService.post('/cidades', dto);
    return response.data!;
  }

  async findAll(): Promise<Cidade[]> {
    const response: ApiResponse<Cidade[]> = await apiService.get('/cidades');
    return response.data || [];
  }

  async findByUf(uf: string): Promise<Cidade[]> {
    const response: ApiResponse<Cidade[]> = await apiService.get(`/cidades/uf/${uf}`);
    return response.data || [];
  }

  async findByCodigoIbge(codigoIbge: string): Promise<Cidade> {
    const response: ApiResponse<Cidade> = await apiService.get(`/cidades/ibge/${codigoIbge}`);
    return response.data!;
  }

  async findOne(id: string): Promise<Cidade> {
    const response: ApiResponse<Cidade> = await apiService.get(`/cidades/${id}`);
    return response.data!;
  }

  async update(id: string, dto: UpdateCidadeDto): Promise<Cidade> {
    const response: ApiResponse<Cidade> = await apiService.patch(`/cidades/${id}`, dto);
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/cidades/${id}`);
  }
}

export const cidadeService = new CidadeService();
