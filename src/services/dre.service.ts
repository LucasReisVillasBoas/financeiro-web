import { apiService } from './api.service';
import type {
  DreResponseDto,
  DreConsolidadoDto,
  DreComparativoDto,
  FilterDreDto,
  ApiResponse,
} from '../types/api.types';

class DreService {
  private readonly baseUrl = '/dre';

  async gerarDre(filtro: FilterDreDto): Promise<ApiResponse<DreResponseDto>> {
    const params = new URLSearchParams();
    params.append('empresaId', filtro.empresaId);
    params.append('dataInicio', filtro.dataInicio);
    params.append('dataFim', filtro.dataFim);

    if (filtro.consolidarPor) {
      params.append('consolidarPor', filtro.consolidarPor);
    }

    return apiService.get<DreResponseDto>(`${this.baseUrl}?${params.toString()}`);
  }

  async gerarDreConsolidado(
    empresaIds: string[],
    dataInicio: string,
    dataFim: string
  ): Promise<ApiResponse<DreConsolidadoDto>> {
    const params = new URLSearchParams();
    params.append('empresaIds', empresaIds.join(','));
    params.append('dataInicio', dataInicio);
    params.append('dataFim', dataFim);

    return apiService.get<DreConsolidadoDto>(`${this.baseUrl}/consolidado?${params.toString()}`);
  }

  async gerarComparativo(
    empresaId: string,
    periodo1Inicio: string,
    periodo1Fim: string,
    periodo2Inicio: string,
    periodo2Fim: string
  ): Promise<ApiResponse<DreComparativoDto>> {
    const params = new URLSearchParams();
    params.append('empresaId', empresaId);
    params.append('periodo1Inicio', periodo1Inicio);
    params.append('periodo1Fim', periodo1Fim);
    params.append('periodo2Inicio', periodo2Inicio);
    params.append('periodo2Fim', periodo2Fim);

    return apiService.get<DreComparativoDto>(`${this.baseUrl}/comparativo?${params.toString()}`);
  }
}

export default new DreService();
