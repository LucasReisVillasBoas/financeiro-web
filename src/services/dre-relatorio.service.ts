import { apiService } from './api.service';
import type { DreResponse, DreFiltros, ApiResponse } from '../types/api.types';

class DreRelatorioService {
  /**
   * Busca o relat�rio DRE com base nos filtros fornecidos
   * @param filtros - Filtros para o relat�rio (dataInicio, dataFim, empresaId, centroCustoId)
   * @returns Dados do DRE com estrutura hier�rquica e totalizadores
   */
  async buscarRelatorio(filtros: DreFiltros): Promise<DreResponse> {
    // Validar que empresaId está presente
    if (!filtros.empresaId) {
      throw new Error('empresaId é obrigatório');
    }

    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    params.append('empresaId', filtros.empresaId);

    if (filtros.centroCustoId && filtros.centroCustoId.trim() !== '') {
      params.append('centroCustoId', filtros.centroCustoId);
    }

    const response: ApiResponse<DreResponse> = await apiService.get(
      `/relatorios/dre?${params.toString()}`
    );

    if (!response.data) {
      throw new Error('Erro ao buscar relatório DRE');
    }
    return response.data;
  }

  /**
   * Exporta o relat�rio DRE em formato CSV
   * @param filtros - Filtros para o relat�rio
   * @returns Blob com o arquivo CSV
   */
  async exportarCSV(filtros: DreFiltros): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    params.append('formato', 'csv');

    if (filtros.empresaId && filtros.empresaId.trim() !== '') {
      params.append('empresaId', filtros.empresaId);
    }

    if (filtros.centroCustoId && filtros.centroCustoId.trim() !== '') {
      params.append('centroCustoId', filtros.centroCustoId);
    }

    const response = await apiService.getBlob(`/relatorios/dre/exportar?${params.toString()}`);

    return response;
  }

  /**
   * Exporta o relat�rio DRE em formato Excel (XLSX)
   * @param filtros - Filtros para o relat�rio
   * @returns Blob com o arquivo XLSX
   */
  async exportarXLSX(filtros: DreFiltros): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    params.append('formato', 'xlsx');

    if (filtros.empresaId && filtros.empresaId.trim() !== '') {
      params.append('empresaId', filtros.empresaId);
    }

    if (filtros.centroCustoId && filtros.centroCustoId.trim() !== '') {
      params.append('centroCustoId', filtros.centroCustoId);
    }

    const response = await apiService.getBlob(`/relatorios/dre/exportar?${params.toString()}`);

    return response;
  }

  /**
   * Exporta o relat�rio DRE em formato PDF
   * @param filtros - Filtros para o relat�rio
   * @returns Blob com o arquivo PDF
   */
  async exportarPDF(filtros: DreFiltros): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    params.append('formato', 'pdf');

    if (filtros.empresaId && filtros.empresaId.trim() !== '') {
      params.append('empresaId', filtros.empresaId);
    }

    if (filtros.centroCustoId && filtros.centroCustoId.trim() !== '') {
      params.append('centroCustoId', filtros.centroCustoId);
    }

    const response = await apiService.getBlob(`/relatorios/dre/exportar?${params.toString()}`);

    return response;
  }
}

export const dreRelatorioService = new DreRelatorioService();
