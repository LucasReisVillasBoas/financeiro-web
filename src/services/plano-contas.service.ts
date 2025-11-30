import type {
  PlanoContas,
  CreatePlanoContasDto,
  UpdatePlanoContasDto,
  FilterPlanoContasDto,
  ImportPlanoContasDto,
  ImportResult,
  ApiResponse,
} from '../types/api.types';
import { apiService } from './api.service';

class PlanoContasService {
  private readonly baseUrl = '/plano-contas';

  async create(data: CreatePlanoContasDto): Promise<ApiResponse<PlanoContas>> {
    return apiService.post<PlanoContas>(this.baseUrl, data);
  }

  async update(id: string, data: UpdatePlanoContasDto): Promise<ApiResponse<PlanoContas>> {
    return apiService.patch<PlanoContas>(`${this.baseUrl}/${id}`, data);
  }

  async findOne(id: string): Promise<ApiResponse<PlanoContas>> {
    return apiService.get<PlanoContas>(`${this.baseUrl}/${id}`);
  }

  async findAll(filters?: FilterPlanoContasDto): Promise<ApiResponse<PlanoContas[]>> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }

    const query = params.toString();
    const url = query ? `${this.baseUrl}?${query}` : this.baseUrl;

    return apiService.get<PlanoContas[]>(url);
  }

  async findByEmpresa(empresaId: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(`${this.baseUrl}/empresa/${empresaId}`);
  }

  async findByTipo(empresaId: string, tipo: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(`${this.baseUrl}/empresa/${empresaId}/tipo/${tipo}`);
  }

  async findAnaliticas(empresaId: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(`${this.baseUrl}/empresa/${empresaId}/analiticas`);
  }

  async findAnaliticasAtivas(empresaId: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(`${this.baseUrl}/empresa/${empresaId}/analiticas-ativas`);
  }

  async findTree(empresaId: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(`${this.baseUrl}/empresa/${empresaId}/tree`);
  }

  async findChildren(id: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(`${this.baseUrl}/${id}/filhos`);
  }

  async verificarUso(id: string): Promise<
    ApiResponse<{
      emUso: boolean;
      contasPagar: number;
      contasReceber: number;
      movimentacoes: number;
      total: number;
      detalhes?: string;
    }>
  > {
    return apiService.get(`${this.baseUrl}/${id}/uso`);
  }

  async substituirConta(
    contaOrigemId: string,
    contaDestinoId: string
  ): Promise<
    ApiResponse<{
      sucesso: boolean;
      contasAtualizadas: number;
      detalhes: {
        contasPagar: number;
        contasReceber: number;
        movimentacoes: number;
      };
    }>
  > {
    return apiService.post(`${this.baseUrl}/${contaOrigemId}/substituir`, { contaDestinoId });
  }

  async getBreadcrumb(id: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(`${this.baseUrl}/${id}/breadcrumb`);
  }

  async search(empresaId: string, term: string): Promise<ApiResponse<PlanoContas[]>> {
    return apiService.get<PlanoContas[]>(
      `${this.baseUrl}/empresa/${empresaId}/search?term=${encodeURIComponent(term)}`
    );
  }

  async inativar(id: string): Promise<ApiResponse<PlanoContas>> {
    return apiService.patch<PlanoContas>(`${this.baseUrl}/${id}/inativar`, {});
  }

  async reativar(id: string): Promise<ApiResponse<PlanoContas>> {
    return apiService.patch<PlanoContas>(`${this.baseUrl}/${id}/reativar`, {});
  }

  async toggleStatus(id: string, ativo: boolean): Promise<ApiResponse<PlanoContas>> {
    return apiService.patch<PlanoContas>(`${this.baseUrl}/${id}/toggle-status`, { ativo });
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiService.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Exportação
  async exportCSV(empresaId: string): Promise<Blob> {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/empresa/${empresaId}/export/csv`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Erro ao exportar CSV');
    }

    return response.blob();
  }

  async exportExcel(empresaId: string): Promise<ApiResponse<any[]>> {
    return apiService.get<any[]>(`${this.baseUrl}/empresa/${empresaId}/export/excel`);
  }

  // Importação
  async importCSV(
    empresaId: string,
    file: File,
    sobrescrever: boolean = false,
    dryRun: boolean = false
  ): Promise<ApiResponse<ImportResult>> {
    const token = localStorage.getItem('token');
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sobrescrever', String(sobrescrever));
    formData.append('dryRun', String(dryRun));

    const response = await fetch(`${API_BASE_URL}${this.baseUrl}/empresa/${empresaId}/import/csv`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Erro ao importar CSV' }));
      throw new Error(error.message || 'Erro ao importar CSV');
    }

    return response.json();
  }

  async importData(data: ImportPlanoContasDto): Promise<ApiResponse<ImportResult>> {
    return apiService.post<ImportResult>(`${this.baseUrl}/empresa/${data.empresaId}/import`, data);
  }

  async validateImport(data: ImportPlanoContasDto): Promise<ApiResponse<ImportResult>> {
    return apiService.post<ImportResult>(
      `${this.baseUrl}/empresa/${data.empresaId}/import/validate`,
      data
    );
  }
}

export default new PlanoContasService();
