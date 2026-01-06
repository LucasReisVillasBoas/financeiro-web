import { apiService } from './api.service';
import type {
  ContaPagar,
  CreateContaPagarDto,
  UpdateContaPagarDto,
  RegistrarBaixaDto,
  CancelarContaPagarDto,
  GerarParcelasDto,
  ApiResponse,
} from '../types/api.types';

class ContaPagarService {
  async create(dto: CreateContaPagarDto): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.post('/contas-pagar', dto);
    if (!response.data) {
      throw new Error('Erro ao criar conta a pagar');
    }
    return response.data;
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
    if (!response.data) {
      throw new Error('Conta a pagar não encontrada');
    }
    return response.data;
  }

  async update(id: string, dto: UpdateContaPagarDto): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.put(`/contas-pagar/${id}`, dto);
    if (!response.data) {
      throw new Error('Erro ao atualizar conta a pagar');
    }
    return response.data;
  }

  async registrarBaixa(id: string, dto: RegistrarBaixaDto): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.post(
      `/contas-pagar/${id}/registrar-baixa`,
      dto
    );
    if (!response.data) {
      throw new Error('Erro ao registrar baixa');
    }
    return response.data;
  }

  async estornarBaixa(id: string): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.post(
      `/contas-pagar/${id}/estornar-baixa`,
      {}
    );
    if (!response.data) {
      throw new Error('Erro ao estornar baixa');
    }
    return response.data;
  }

  async cancelar(id: string, dto: CancelarContaPagarDto): Promise<ContaPagar> {
    const response: ApiResponse<ContaPagar> = await apiService.post(
      `/contas-pagar/${id}/cancelar`,
      dto
    );
    if (!response.data) {
      throw new Error('Erro ao cancelar conta a pagar');
    }
    return response.data;
  }

  async gerarParcelas(dto: GerarParcelasDto): Promise<ContaPagar[]> {
    const response: ApiResponse<ContaPagar[]> = await apiService.post(
      '/contas-pagar/gerar-parcelas',
      dto
    );
    if (!response.data) {
      throw new Error('Erro ao gerar parcelas');
    }
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/contas-pagar/${id}`);
  }
}

export const contaPagarService = new ContaPagarService();
