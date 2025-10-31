import { apiService } from './api.service';
import type {
  ContaBancaria,
  CreateContaBancariaDto,
  UpdateContaBancariaDto,
  ApiResponse,
} from '../types/api.types';

class ContaBancariaService {
  async create(dto: CreateContaBancariaDto): Promise<ContaBancaria> {
    const response: ApiResponse<ContaBancaria> = await apiService.post('/contas-bancarias', dto);
    return response.data!;
  }

  async findAll(): Promise<ContaBancaria[]> {
    const response: ApiResponse<ContaBancaria[]> = await apiService.get('/contas-bancarias');
    return response.data || [];
  }

  async findByEmpresa(empresaId: string): Promise<ContaBancaria[]> {
    const response: ApiResponse<ContaBancaria[]> = await apiService.get(
      `/contas-bancarias/empresa/${empresaId}`
    );
    return response.data || [];
  }

  async findOne(id: string): Promise<ContaBancaria> {
    const response: ApiResponse<ContaBancaria> = await apiService.get(`/contas-bancarias/${id}`);
    return response.data!;
  }

  async update(id: string, dto: UpdateContaBancariaDto): Promise<ContaBancaria> {
    const response: ApiResponse<ContaBancaria> = await apiService.put(
      `/contas-bancarias/${id}`,
      dto
    );
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/contas-bancarias/${id}`);
  }

  async toggleStatus(id: string): Promise<ContaBancaria> {
    const response: ApiResponse<ContaBancaria> = await apiService.patch(
      `/contas-bancarias/${id}/toggle-status`,
      id
    );
    return response.data!;
  }
}

export const contaBancariaService = new ContaBancariaService();
