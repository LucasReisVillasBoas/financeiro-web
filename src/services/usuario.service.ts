import { apiService } from './api.service';
import type {
  User,
  ApiResponse,
  UsuarioEmpresaFilial,
  AssociarEmpresaFilialDto,
} from '../types/api.types';

export interface UsuarioCreateDto {
  nome: string;
  email: string;
  login: string;
  senha: string;
  telefone: string;
  cargo: string;
  ativo?: boolean;
}

export interface UsuarioUpdateDto {
  nome?: string;
  email?: string;
  cpf?: string;
  data_nascimento?: string;
}

class UsuarioService {
  async create(dto: UsuarioCreateDto): Promise<User> {
    const response: ApiResponse<User> = await apiService.post('/usuario/cadastro', dto);
    return response.data!;
  }

  async getById(): Promise<User | null> {
    const response: ApiResponse<User> = await apiService.get(`/usuario`);
    return response.data || null;
  }

  async getAll(): Promise<User[]> {
    const response: ApiResponse<User[]> = await apiService.get(`/usuario/all`);
    return response.data || [];
  }

  async update(id: string, dto: UsuarioUpdateDto): Promise<User> {
    const response: ApiResponse<User> = await apiService.patch(`/usuario/${id}`, dto);
    return response.data!;
  }

  async associarEmpresaFilial(
    usuarioId: string,
    dto: AssociarEmpresaFilialDto
  ): Promise<UsuarioEmpresaFilial> {
    const response: ApiResponse<UsuarioEmpresaFilial> = await apiService.post(
      `/usuario/${usuarioId}/empresas`,
      dto
    );
    return response.data!;
  }

  async listarAssociacoes(usuarioId: string): Promise<UsuarioEmpresaFilial[]> {
    const response: ApiResponse<UsuarioEmpresaFilial[]> = await apiService.get(
      `/usuario/${usuarioId}/empresas`
    );
    return response.data || [];
  }

  async removerAssociacao(usuarioId: string, assocId: string): Promise<void> {
    await apiService.delete(`/usuario/${usuarioId}/empresas/${assocId}`);
  }
}

export const usuarioService = new UsuarioService();
