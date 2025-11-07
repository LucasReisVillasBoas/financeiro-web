import { apiService } from './api.service';
import type {
  MovimentacaoBancaria,
  CreateMovimentacaoBancariaDto,
  UpdateMovimentacaoBancariaDto,
  ConciliarMovimentacoesDto,
  ConciliacaoResponse,
  ApiResponse,
} from '../types/api.types';

class MovimentacaoBancariaService {
  async create(dto: CreateMovimentacaoBancariaDto): Promise<MovimentacaoBancaria> {
    const response: ApiResponse<MovimentacaoBancaria> = await apiService.post(
      '/movimentacoes-bancarias',
      dto
    );
    return response.data!;
  }

  async findAll(): Promise<MovimentacaoBancaria[]> {
    const response: ApiResponse<MovimentacaoBancaria[]> = await apiService.get(
      '/movimentacoes-bancarias'
    );
    return response.data || [];
  }

  async findByPeriodo(dataInicio: string, dataFim: string): Promise<MovimentacaoBancaria[]> {
    const response: ApiResponse<MovimentacaoBancaria[]> = await apiService.get(
      `/movimentacoes-bancarias/periodo?dataInicio=${dataInicio}&dataFim=${dataFim}`
    );
    return response.data || [];
  }

  async findByConta(contaId: string): Promise<MovimentacaoBancaria[]> {
    const response: ApiResponse<MovimentacaoBancaria[]> = await apiService.get(
      `/movimentacoes-bancarias/conta/${contaId}`
    );
    return response.data || [];
  }

  async findOne(id: string): Promise<MovimentacaoBancaria> {
    const response: ApiResponse<MovimentacaoBancaria> = await apiService.get(
      `/movimentacoes-bancarias/${id}`
    );
    return response.data!;
  }

  async update(id: string, dto: UpdateMovimentacaoBancariaDto): Promise<MovimentacaoBancaria> {
    const response: ApiResponse<MovimentacaoBancaria> = await apiService.put(
      `/movimentacoes-bancarias/${id}`,
      dto
    );
    return response.data!;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/movimentacoes-bancarias/${id}`);
  }

  async conciliar(dto: ConciliarMovimentacoesDto): Promise<ConciliacaoResponse> {
    const response: ApiResponse<ConciliacaoResponse> = await apiService.post(
      '/movimentacoes-bancarias/conciliar',
      dto
    );
    return response.data!;
  }

  async desconciliar(dto: ConciliarMovimentacoesDto): Promise<ConciliacaoResponse> {
    const response: ApiResponse<ConciliacaoResponse> = await apiService.post(
      '/movimentacoes-bancarias/desconciliar',
      dto
    );
    return response.data!;
  }
}

export const movimentacaoBancariaService = new MovimentacaoBancariaService();
