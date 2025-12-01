import { apiService } from './api.service';
import type {
  ApiResponse,
  ExtratoBancario,
  ResultadoImportacao,
  FormatoExtrato,
} from '../types/api.types';

export class ExtratoBancarioService {
  /**
   * Importa extrato bancário (OFX ou CSV)
   */
  async importar(
    contaBancariaId: string,
    formato: FormatoExtrato,
    arquivo: File
  ): Promise<ApiResponse<ResultadoImportacao>> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('contaBancariaId', contaBancariaId);
    formData.append('formato', formato);

    return apiService.postFormData<ResultadoImportacao>('/extratos-bancarios/importar', formData);
  }

  /**
   * Lista todos os extratos importados
   */
  async findAll(contaBancariaId?: string): Promise<ExtratoBancario[]> {
    const queryString = contaBancariaId ? `?contaBancariaId=${contaBancariaId}` : '';
    const response: ApiResponse<ExtratoBancario[]> = await apiService.get(
      `/extratos-bancarios${queryString}`
    );
    return response.data || [];
  }

  /**
   * Lista extratos pendentes de conciliação
   */
  async findPendentes(contaBancariaId: string): Promise<ExtratoBancario[]> {
    const response: ApiResponse<ExtratoBancario[]> = await apiService.get(
      `/extratos-bancarios/pendentes?contaBancariaId=${contaBancariaId}`
    );
    return response.data || [];
  }

  /**
   * Aceita sugestão de conciliação
   */
  async aceitarSugestao(itemId: string): Promise<void> {
    await apiService.post(`/extratos-bancarios/${itemId}/aceitar`, {});
  }

  /**
   * Rejeita sugestão de conciliação
   */
  async rejeitarSugestao(itemId: string): Promise<void> {
    await apiService.post(`/extratos-bancarios/${itemId}/rejeitar`, {});
  }

  /**
   * Ignora item do extrato
   */
  async ignorarItem(itemId: string): Promise<void> {
    await apiService.post(`/extratos-bancarios/${itemId}/ignorar`, {});
  }
}

export const extratoBancarioService = new ExtratoBancarioService();
export default extratoBancarioService;
