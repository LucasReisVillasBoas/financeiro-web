import api from './api';
import {
  ApiResponse,
  ExtratoBancario,
  ResultadoImportacao,
  FormatoExtrato
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

    const response = await api.post<ApiResponse<ResultadoImportacao>>(
      '/extratos-bancarios/importar',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data;
  }

  /**
   * Lista todos os extratos importados
   */
  async findAll(contaBancariaId?: string): Promise<ApiResponse<ExtratoBancario[]>> {
    const params = contaBancariaId ? { contaBancariaId } : {};
    const response = await api.get<ApiResponse<ExtratoBancario[]>>(
      '/extratos-bancarios',
      { params }
    );
    return response.data;
  }

  /**
   * Lista extratos pendentes de conciliação
   */
  async findPendentes(contaBancariaId: string): Promise<ApiResponse<ExtratoBancario[]>> {
    const response = await api.get<ApiResponse<ExtratoBancario[]>>(
      '/extratos-bancarios/pendentes',
      { params: { contaBancariaId } }
    );
    return response.data;
  }

  /**
   * Aceita sugestão de conciliação
   */
  async aceitarSugestao(itemId: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
      `/extratos-bancarios/${itemId}/aceitar`
    );
    return response.data;
  }

  /**
   * Rejeita sugestão de conciliação
   */
  async rejeitarSugestao(itemId: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
      `/extratos-bancarios/${itemId}/rejeitar`
    );
    return response.data;
  }

  /**
   * Ignora item do extrato
   */
  async ignorarItem(itemId: string): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>(
      `/extratos-bancarios/${itemId}/ignorar`
    );
    return response.data;
  }
}

export default new ExtratoBancarioService();
