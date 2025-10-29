import { apiService } from './api.service';
import type {
  ContaReceber,
  CreateContaReceberDto,
  UpdateContaReceberDto,
  ApiResponse,
} from '../types/api.types';

class ContaReceberService {
  async create(dto: CreateContaReceberDto): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.post('/contas-receber', dto);
    return response.data!;
  }

  async findAll(): Promise<ContaReceber[]> {
    const response: ApiResponse<ContaReceber[]> = await apiService.get('/contas-receber');
    return response.data || [];
  }

  async findByEmpresa(empresaId: string): Promise<ContaReceber[]> {
    const response: ApiResponse<ContaReceber[]> = await apiService.get(
      `/contas-receber/empresa/${empresaId}`
    );
    return response.data || [];
  }

  async findOne(id: string): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.get(`/contas-receber/${id}`);
    return response.data!;
  }

  async update(id: string, dto: UpdateContaReceberDto): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.put(
      `/contas-receber/${id}`,
      dto
    );
    return response.data!;
  }

  async marcarComoRecebida(id: string): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.patch(
      `/contas-receber/${id}/receber`,
      {}
    );
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/contas-receber/${id}`);
  }
}

export const contaReceberService = new ContaReceberService();
