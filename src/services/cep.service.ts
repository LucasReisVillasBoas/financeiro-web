import { apiService } from './api.service';

export interface CepData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  ibge: string;
  ddd: string;
}

export const cepService = {
  buscar: async (cep: string): Promise<CepData | null> => {
    try {
      const cepNumbers = cep.replace(/\D/g, '');
      if (cepNumbers.length !== 8) {
        return null;
      }
      const response = await apiService.get<CepData>(`/cep/${cepNumbers}`);
      return response.data;
    } catch {
      return null;
    }
  },
};
