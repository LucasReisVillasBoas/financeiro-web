import { apiService } from './api.service';
import type {
  ContaReceber,
  CreateContaReceberDto,
  CreateContaReceberParceladaDto,
  UpdateContaReceberDto,
  CancelarContaReceberDto,
  ApiResponse,
} from '../types/api.types';

class ContaReceberService {
  async create(dto: CreateContaReceberDto): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.post('/contas-receber', dto);
    if (!response.data) {
      throw new Error('Erro ao criar conta a receber');
    }
    return response.data;
  }

  async createParcelado(dto: CreateContaReceberParceladaDto): Promise<ContaReceber[]> {
    const response: ApiResponse<ContaReceber[]> = await apiService.post(
      '/contas-receber/parcelado',
      dto
    );
    if (!response.data) {
      throw new Error('Erro ao criar contas parceladas');
    }
    return response.data;
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

  async findByPessoa(pessoaId: string): Promise<ContaReceber[]> {
    const response: ApiResponse<ContaReceber[]> = await apiService.get(
      `/contas-receber/pessoa/${pessoaId}`
    );
    return response.data || [];
  }

  async findOne(id: string): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.get(`/contas-receber/${id}`);
    if (!response.data) {
      throw new Error('Conta a receber não encontrada');
    }
    return response.data;
  }

  async update(id: string, dto: UpdateContaReceberDto): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.put(`/contas-receber/${id}`, dto);
    if (!response.data) {
      throw new Error('Erro ao atualizar conta a receber');
    }
    return response.data;
  }

  async cancelar(id: string, dto: CancelarContaReceberDto): Promise<ContaReceber> {
    const response: ApiResponse<ContaReceber> = await apiService.patch(
      `/contas-receber/${id}/cancelar`,
      dto
    );
    if (!response.data) {
      throw new Error('Erro ao cancelar conta a receber');
    }
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/contas-receber/${id}`);
  }
}

export const contaReceberService = new ContaReceberService();
