import { apiService } from './api.service';
import type {
  ContaPagar,
  CreateContaPagarDto,
  UpdateContaPagarDto,
  ApiResponse,
} from '../types/api.types';

class ContaPagarService {
  async create(dto: CreateContaPagarDto): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.post('/contas-pagar', dto);
    return response.data!;
  }

  async findAll(): Promise<ContaPagar[]> {
    const response: ApiResponse<ContaPagar[]> = await apiService.get('/contas-pagar');
    return response.data || [];
  }

  async findByEmpresa(empresaId: string): Promise<ContaPagar[]> {
    const response: ApiResponse<ContaPagar[]> = await apiService.get(
      `/contas-pagar/empresa/${empresaId}`
    );
    return response.data || [];
  }

  async findOne(id: string): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.get(`/contas-pagar/${id}`);
    return response.data!;
  }

  async update(id: string, dto: UpdateContaPagarDto): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.put(
      `/contas-pagar/${id}`,
      dto
    );
    return response.data!;
  }

  async marcarComoPaga(id: string): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.patch(
      `/contas-pagar/${id}/pagar`,
      {}
    );
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/contas-pagar/${id}`);
  }
}

export const contaPagarService = new ContaPagarService();
