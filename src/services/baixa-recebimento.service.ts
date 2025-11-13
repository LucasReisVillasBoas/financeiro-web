import { apiService } from './api.service';
import type {
  BaixaRecebimento,
  CreateBaixaRecebimentoDto,
  ApiResponse,
} from '../types/api.types';

class BaixaRecebimentoService {
  async create(dto: CreateBaixaRecebimentoDto): Promise<BaixaRecebimento> {
    const response: ApiResponse<BaixaRecebimento> = await apiService.post(
      '/baixas-recebimento',
      dto
    );
    return response.data!;
  }

  async findAll(): Promise<BaixaRecebimento[]> {
    const response: ApiResponse<BaixaRecebimento[]> = await apiService.get('/baixas-recebimento');
    return response.data || [];
  }

  async findByContaReceber(contaReceberId: string): Promise<BaixaRecebimento[]> {
    const response: ApiResponse<BaixaRecebimento[]> = await apiService.get(
      `/baixas-recebimento/conta-receber/${contaReceberId}`
    );
    return response.data || [];
  }

  async findOne(id: string): Promise<BaixaRecebimento> {
    const response: ApiResponse<BaixaRecebimento> = await apiService.get(
      `/baixas-recebimento/${id}`
    );
    return response.data!;
  }

  async estornar(id: string): Promise<BaixaRecebimento> {
    const response: ApiResponse<BaixaRecebimento> = await apiService.delete(
      `/baixas-recebimento/${id}/estornar`
    );
    return response.data!;
  }
}

export const baixaRecebimentoService = new BaixaRecebimentoService();
