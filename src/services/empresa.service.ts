import { apiService } from './api.service';
import type {
  Empresa,
  CreateEmpresaDto,
  UpdateEmpresaDto,
  Filial,
  CreateFilialDto,
  UpdateFilialDto,
  ApiResponse,
} from '../types/api.types';

class EmpresaService {
  async create(dto: CreateEmpresaDto): Promise<Empresa> {
    const response: ApiResponse<Empresa> = await apiService.post('/empresas', dto);
    if (!response.data) {
      throw new Error('Erro ao criar empresa');
    }
    return response.data;
  }

  async findByCliente(clienteId: string): Promise<Empresa[]> {
    const response: ApiResponse<Empresa[]> = await apiService.get(`/empresas/cliente/${clienteId}`);
    return response.data || [];
  }

  async findOne(id: string): Promise<Empresa> {
    const response: ApiResponse<Empresa> = await apiService.get(`/empresas/${id}`);
    if (!response.data) {
      throw new Error('Empresa não encontrada');
    }
    return response.data;
  }

  async findByDocument(cnpj: string): Promise<Empresa> {
    const response: ApiResponse<Empresa> = await apiService.get(`/empresas/document/${cnpj}`);
    if (!response.data) {
      throw new Error('Empresa não encontrada');
    }
    return response.data;
  }

  async update(id: string, dto: UpdateEmpresaDto): Promise<Empresa> {
    const response: ApiResponse<Empresa> = await apiService.put(`/empresas/${id}`, dto);
    if (!response.data) {
      throw new Error('Erro ao atualizar empresa');
    }
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/empresas/${id}`);
  }

  // Filiais
  async createFilial(empresaId: string, dto: CreateFilialDto): Promise<Filial> {
    const response: ApiResponse<Filial> = await apiService.post(
      `/empresas/${empresaId}/filiais`,
      dto
    );
    if (!response.data) {
      throw new Error('Erro ao criar filial');
    }
    return response.data;
  }

  async listFiliais(empresaId: string): Promise<Filial[]> {
    const response: ApiResponse<Filial[]> = await apiService.get(`/empresas/${empresaId}/filiais`);
    return response.data || [];
  }

  async updateFilial(filialId: string, dto: UpdateFilialDto): Promise<Filial> {
    const response: ApiResponse<Filial> = await apiService.put(
      `/empresas/filiais/${filialId}`,
      dto
    );
    if (!response.data) {
      throw new Error('Erro ao atualizar filial');
    }
    return response.data;
  }

  async deleteFilial(filialId: string): Promise<void> {
    await apiService.delete(`/empresas/filiais/${filialId}`);
  }
}

export const empresaService = new EmpresaService();
