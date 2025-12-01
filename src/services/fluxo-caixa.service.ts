import { apiService } from './api.service';
import type { FluxoCaixaResponse, FluxoCaixaFiltros, ApiResponse } from '../types/api.types';

class FluxoCaixaService {
  /**
   * Busca o relatório de fluxo de caixa com base nos filtros fornecidos
   * @param filtros - Filtros para o relatório (dataInicio, dataFim, contaBancariaId, empresaId, consolidado)
   * @returns Dados do fluxo de caixa com linhas diárias e totais
   */
  async buscarRelatorio(filtros: FluxoCaixaFiltros): Promise<FluxoCaixaResponse> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);

    if (filtros.contaBancariaId) {
      params.append('contaBancariaId', filtros.contaBancariaId);
    }

    if (filtros.empresaId) {
      params.append('empresaId', filtros.empresaId);
    }

    if (filtros.consolidado !== undefined) {
      params.append('consolidado', filtros.consolidado.toString());
    }

    const response: ApiResponse<FluxoCaixaResponse> = await apiService.get(
      `/relatorios/fluxo-caixa?${params.toString()}`
    );

    return response.data!;
  }

  /**
   * Exporta o relatório de fluxo de caixa em formato CSV
   * @param filtros - Filtros para o relatório
   * @returns Blob com o arquivo CSV
   */
  async exportarCSV(filtros: FluxoCaixaFiltros): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    params.append('formato', 'csv');

    if (filtros.contaBancariaId) {
      params.append('contaBancariaId', filtros.contaBancariaId);
    }

    if (filtros.empresaId) {
      params.append('empresaId', filtros.empresaId);
    }

    if (filtros.consolidado !== undefined) {
      params.append('consolidado', filtros.consolidado.toString());
    }

    const response = await apiService.getBlob(
      `/relatorios/fluxo-caixa/exportar?${params.toString()}`
    );

    return response;
  }

  /**
   * Exporta o relatório de fluxo de caixa em formato Excel (XLSX)
   * @param filtros - Filtros para o relatório
   * @returns Blob com o arquivo XLSX
   */
  async exportarXLSX(filtros: FluxoCaixaFiltros): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    params.append('formato', 'xlsx');

    if (filtros.contaBancariaId) {
      params.append('contaBancariaId', filtros.contaBancariaId);
    }

    if (filtros.empresaId) {
      params.append('empresaId', filtros.empresaId);
    }

    if (filtros.consolidado !== undefined) {
      params.append('consolidado', filtros.consolidado.toString());
    }

    const response = await apiService.getBlob(
      `/relatorios/fluxo-caixa/exportar?${params.toString()}`
    );

    return response;
  }

  /**
   * Exporta o relatório de fluxo de caixa em formato PDF
   * @param filtros - Filtros para o relatório
   * @returns Blob com o arquivo PDF
   */
  async exportarPDF(filtros: FluxoCaixaFiltros): Promise<Blob> {
    const params = new URLSearchParams();
    params.append('dataInicio', filtros.dataInicio);
    params.append('dataFim', filtros.dataFim);
    params.append('formato', 'pdf');

    if (filtros.contaBancariaId) {
      params.append('contaBancariaId', filtros.contaBancariaId);
    }

    if (filtros.empresaId) {
      params.append('empresaId', filtros.empresaId);
    }

    if (filtros.consolidado !== undefined) {
      params.append('consolidado', filtros.consolidado.toString());
    }

    const response = await apiService.getBlob(
      `/relatorios/fluxo-caixa/exportar?${params.toString()}`
    );

    return response;
  }
}

export const fluxoCaixaService = new FluxoCaixaService();
