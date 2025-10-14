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
    const response: ApiResponse<Empresa> = await apiService.post(
      '/empresas',
      dto
    );
    return response.data!;
  }

  async findByCliente(clienteId: string): Promise<Empresa[]> {
    const response: ApiResponse<Empresa[]> = await apiService.get(
      `/empresas/cliente/${clienteId}`
    );
    return response.data || [];
  }

  async findOne(id: string): Promise<Empresa> {
    const response: ApiResponse<Empresa> = await apiService.get(
      `/empresas/${id}`
    );
    return response.data!;
  }

  async update(id: string, dto: UpdateEmpresaDto): Promise<Empresa> {
    const response: ApiResponse<Empresa> = await apiService.put(
      `/empresas/${id}`,
      dto
    );
    return response.data!;
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
    return response.data!;
  }

  async listFiliais(empresaId: string): Promise<Filial[]> {
    const response: ApiResponse<Filial[]> = await apiService.get(
      `/empresas/${empresaId}/filiais`
    );
    return response.data || [];
  }

  async updateFilial(filialId: string, dto: UpdateFilialDto): Promise<Filial> {
    const response: ApiResponse<Filial> = await apiService.put(
      `/empresas/filiais/${filialId}`,
      dto
    );
    return response.data!;
  }

  async deleteFilial(filialId: string): Promise<void> {
    await apiService.delete(`/empresas/filiais/${filialId}`);
  }
}

export const empresaService = new EmpresaService();
