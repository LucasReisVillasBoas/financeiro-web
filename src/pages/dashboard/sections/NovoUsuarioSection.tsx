import React, { useState, useEffect } from 'react';
import { InputField } from '../../../components/InputField';
import { SelectField, ROLES_USUARIO } from '../../../components/SelectField';
import { usuarioService } from '../../../services/usuario.service';
import { empresaService } from '../../../services/empresa.service';
import { perfilService } from '../../../services/perfil.service';
import { useAuth } from '../../../context/AuthContext';
import type { UsuarioCreateDto } from '../../../services/usuario.service';
import type { Empresa, Filial } from '../../../types/api.types';

// Módulos disponíveis no sistema
const MODULOS_DISPONIVEIS = [
  { value: 'empresas', label: 'Empresas', descricao: 'Gestão de empresas e filiais' },
  { value: 'financeiro', label: 'Financeiro', descricao: 'Contas a pagar/receber, movimentações' },
  { value: 'usuarios', label: 'Usuários', descricao: 'Gestão de usuários e perfis' },
  { value: 'relatorios', label: 'Relatórios', descricao: 'Relatórios e exportações' },
  { value: 'contatos', label: 'Contatos', descricao: 'Gestão de contatos' },
  { value: 'cidades', label: 'Cidades', descricao: 'Cadastro de cidades' },
  { value: 'pessoas', label: 'Pessoas', descricao: 'Cadastro de pessoas/clientes' },
  { value: 'auditoria', label: 'Auditoria', descricao: 'Logs de auditoria' },
];

// Níveis de permissão hierárquicos
const NIVEIS_PERMISSAO = [
  { value: '', label: 'Sem acesso', acoes: [] },
  { value: 'visualizar', label: 'Visualizar', acoes: ['visualizar', 'listar'] },
  { value: 'editar', label: 'Editar', acoes: ['visualizar', 'listar', 'editar'] },
  { value: 'criar', label: 'Criar', acoes: ['visualizar', 'listar', 'editar', 'criar'] },
  {
    value: 'excluir',
    label: 'Excluir',
    acoes: ['visualizar', 'listar', 'editar', 'criar', 'excluir'],
  },
  {
    value: 'completa',
    label: 'Completa',
    acoes: ['visualizar', 'listar', 'editar', 'criar', 'excluir', 'exportar'],
  },
];

interface NovoUsuarioSectionProps {
  onNavigate: (section: string) => void;
}

export const NovoUsuarioSection: React.FC<NovoUsuarioSectionProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [telefone, setTelefone] = useState('');
  const [perfil, setPerfil] = useState('');
  const [permissoesPorModulo, setPermissoesPorModulo] = useState<Record<string, string>>({});
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasComFiliais, setEmpresasComFiliais] = useState<Map<string, Filial[]>>(new Map());
  const [selectedEmpresas, setSelectedEmpresas] = useState<Set<string>>(new Set());
  const [selectedFiliais, setSelectedFiliais] = useState<Set<string>>(new Set());
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.clienteId) {
        setLoadingEmpresas(false);
        return;
      }

      try {
        setLoadingEmpresas(true);

        const empresasList = await empresaService.findByCliente(user.clienteId);
        setEmpresas(empresasList.filter(emp => !emp.sede));

        const filiaisMap = new Map<string, Filial[]>();
        for (const empresa of empresasList.filter(emp => !emp.sede)) {
          const filiais = await empresaService.listFiliais(empresa.id);
          filiaisMap.set(empresa.id, filiais);
        }
        setEmpresasComFiliais(filiaisMap);
      } catch (err: unknown) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar empresas, filiais e perfis');
      } finally {
        setLoadingEmpresas(false);
      }
    };

    fetchData();
  }, [user?.clienteId]);

  const handleCancel = () => {
    onNavigate('usuarios-listar');
  };

  const toggleEmpresa = (empresaId: string) => {
    const newSelected = new Set(selectedEmpresas);
    if (newSelected.has(empresaId)) {
      newSelected.delete(empresaId);
      const filiais = empresasComFiliais.get(empresaId) || [];
      const newSelectedFiliais = new Set(selectedFiliais);
      filiais.forEach(f => newSelectedFiliais.delete(f.id));
      setSelectedFiliais(newSelectedFiliais);
    } else {
      newSelected.add(empresaId);
    }
    setSelectedEmpresas(newSelected);
  };

  const toggleFilial = (empresaId: string, filialId: string) => {
    const newSelected = new Set(selectedFiliais);
    if (newSelected.has(filialId)) {
      newSelected.delete(filialId);
    } else {
      newSelected.add(filialId);
      const empresasSelected = new Set(selectedEmpresas);
      empresasSelected.add(empresaId);
      setSelectedEmpresas(empresasSelected);
    }
    setSelectedFiliais(newSelected);
  };

  const handleNivelChange = (modulo: string, nivel: string) => {
    setPermissoesPorModulo(prev => ({
      ...prev,
      [modulo]: nivel,
    }));
  };

  // Converte níveis selecionados para o formato de permissões do backend
  const converterParaPermissoes = (): Record<string, string[]> => {
    const permissoes: Record<string, string[]> = {};

    Object.entries(permissoesPorModulo).forEach(([modulo, nivel]) => {
      if (nivel) {
        const nivelConfig = NIVEIS_PERMISSAO.find(n => n.value === nivel);
        if (nivelConfig && nivelConfig.acoes.length > 0) {
          permissoes[modulo] = [...nivelConfig.acoes];
        }
      }
    });

    return permissoes;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const dto: UsuarioCreateDto = {
      nome: formData.get('nome') as string,
      email: formData.get('email') as string,
      login: formData.get('login') as string,
      senha: formData.get('senha') as string,
      telefone: telefone,
      cargo: formData.get('cargo') as string,
      ativo: true,
      cidade: {
        nome: formData.get('cidadeNome') as string,
        codigoIbge: formData.get('cidadeCodigoIbge') as string,
        uf: formData.get('cidadeUf') as string,
        codigoBacen: (formData.get('cidadeCodigoBacen') as string) || undefined,
      },
      contatos: [
        {
          nome: formData.get('contatoNome') as string,
          funcao: formData.get('contatoFuncao') as string,
          celular: formData.get('contatoCelular') as string,
          email: formData.get('email') as string,
          telefone: telefone,
        },
      ],
    };

    const perfilNome = perfil;

    if (!dto.nome || !dto.email || !dto.login || !dto.senha || !dto.cargo || !dto.telefone) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    if (!perfilNome) {
      setError('Por favor, informe o perfil do usuário.');
      setLoading(false);
      return;
    }

    const permissoes = converterParaPermissoes();
    const temPermissoes = Object.keys(permissoes).length > 0;

    if (!temPermissoes) {
      setError('Por favor, selecione pelo menos uma permissão para o usuário.');
      setLoading(false);
      return;
    }

    if (selectedEmpresas.size === 0 && selectedFiliais.size === 0) {
      setError('Por favor, selecione pelo menos uma empresa ou filial.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email)) {
      setError('Por favor, insira um email válido.');
      setLoading(false);
      return;
    }

    if (dto.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const novoUsuario = await usuarioService.create(dto);
      const associacoes: Promise<unknown>[] = [];

      for (const empresaId of selectedEmpresas) {
        associacoes.push(usuarioService.associarEmpresaFilial(novoUsuario.id, { empresaId }));
      }

      for (const filialId of selectedFiliais) {
        associacoes.push(
          usuarioService.associarEmpresaFilial(novoUsuario.id, { empresaId: filialId })
        );
      }

      if (associacoes.length > 0) {
        await Promise.all(associacoes);
      }

      // Cria perfil para cada empresa/filial selecionada com as permissões configuradas
      const empresaIds = [...selectedEmpresas, ...selectedFiliais];
      for (const empresaId of empresaIds) {
        await perfilService.create({
          clienteId: novoUsuario.id,
          empresaId: empresaId,
          nome: perfilNome,
          permissoes: permissoes,
        });
      }
      setSuccess('Usuário cadastrado e associado com sucesso!');
      form.reset();
      setTelefone('');
      setPerfil('');
      setPermissoesPorModulo({});
      setSelectedEmpresas(new Set());
      setSelectedFiliais(new Set());

      setTimeout(() => {
        onNavigate('usuarios-listar');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      console.error('Erro ao cadastrar usuário:', err);
      setError(error.message || 'Erro ao cadastrar usuário');
    } finally {
      setLoading(false);
    }
  };

  const formatPhone = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 10) {
      return cleaned.replace(/^(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      const formatted = cleaned
        .replace(/^(\d{2})(\d)/, '($1)$2')
        .replace(/(\d{5})(\d)/, '$1-$2')
        .substring(0, 14);
      return formatted;
    }
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setTelefone(formatted);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {error && <div className="mb-4 p-3 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {success && (
        <div className="mb-4 p-3 bg-green-100/30 text-green-800 rounded-md">{success}</div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-[var(--color-surface)] p-6 rounded-md shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            id="nome"
            label="Nome Completo"
            type="text"
            placeholder="Digite o nome completo"
            required
          />
          <InputField
            id="email"
            label="E-mail"
            type="email"
            placeholder="usuario@email.com"
            required
          />
          <InputField id="login" label="Login" type="text" placeholder="Digite o login" required />
          <InputField
            id="senha"
            label="Senha"
            type="password"
            placeholder="Digite a senha (mínimo 6 caracteres)"
            required
          />
          <InputField
            id="telefone"
            label="Telefone"
            type="tel"
            placeholder="(00)00000-0000"
            value={telefone}
            onChange={handleTelefoneChange}
            required
          />
          <InputField id="cargo" label="Cargo" type="text" placeholder="Digite o cargo" required />
          <SelectField
            id="perfil"
            label="Perfil"
            placeholder="Selecione o perfil"
            options={ROLES_USUARIO}
            value={perfil}
            onChange={e => setPerfil(e.target.value)}
            required
          />
        </div>

        {/* Seção de Permissões */}
        <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
          <div>
            <h3 className="text-lg font-medium text-[var(--color-text)]">Permissões por Módulo</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mt-1">
              Selecione o nível de acesso para cada módulo. Cada nível inclui as permissões dos
              níveis anteriores.
            </p>
          </div>

          <div className="space-y-3">
            {MODULOS_DISPONIVEIS.map(modulo => (
              <div
                key={modulo.value}
                className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 border border-[var(--color-border)] rounded-md bg-[var(--color-bg)]"
              >
                <div className="flex-1">
                  <h4 className="font-medium text-[var(--color-text)] text-sm">{modulo.label}</h4>
                  <p className="text-xs text-[var(--color-text-secondary)]">{modulo.descricao}</p>
                </div>
                <div className="sm:w-40">
                  <select
                    value={permissoesPorModulo[modulo.value] || ''}
                    onChange={e => handleNivelChange(modulo.value, e.target.value)}
                    className="w-full px-3 py-1.5 text-sm rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {NIVEIS_PERMISSAO.map(nivel => (
                      <option key={nivel.value} value={nivel.value}>
                        {nivel.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seção de Cidade */}
        <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
          <h3 className="text-lg font-medium text-[var(--color-text)]">Cidade (Opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="cidadeNome"
              label="Nome da Cidade"
              type="text"
              placeholder="Digite o nome da cidade"
            />
            <InputField
              id="cidadeCodigoIbge"
              label="Código IBGE"
              type="text"
              placeholder="Digite o código IBGE"
            />
            <InputField id="cidadeUf" label="UF" type="text" placeholder="Ex: SP" />
            <InputField
              id="cidadeCodigoBacen"
              label="Código Bacen (Opcional)"
              type="text"
              placeholder="Digite o código Bacen"
            />
          </div>
        </div>

        {/* Seção de Contato */}
        <div className="space-y-4 pt-6 border-t border-[var(--color-border)]">
          <h3 className="text-lg font-medium text-[var(--color-text)]">Contato (Opcional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="contatoNome"
              label="Nome do Contato"
              type="text"
              placeholder="Digite o nome do contato"
            />
            <InputField
              id="contatoFuncao"
              label="Função"
              type="text"
              placeholder="Digite a função"
            />
            <InputField
              id="contatoCelular"
              label="Celular do Contato"
              type="tel"
              placeholder="(00)00000-0000"
            />
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-[var(--color-border)]">
          <h3 className="text-lg font-medium text-[var(--color-text)]">
            Associar a Empresas e Filiais
          </h3>

          {loadingEmpresas ? (
            <div className="text-center py-4 text-[var(--color-text-muted)]">
              Carregando empresas...
            </div>
          ) : empresas.length === 0 ? (
            <div className="text-center py-4 text-[var(--color-text-muted)]">
              Nenhuma empresa disponível para associação
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {empresas.map(empresa => (
                <div
                  key={empresa.id}
                  className="border border-[var(--color-border)] rounded-md p-4 space-y-3"
                >
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedEmpresas.has(empresa.id)}
                      onChange={() => toggleEmpresa(empresa.id)}
                      className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-[var(--color-text)]">
                        {empresa.nome_fantasia}
                      </div>
                      <div className="text-sm text-[var(--color-text-secondary)]">
                        {empresa.razao_social} - {empresa.cnpj_cpf}
                      </div>
                    </div>
                  </label>

                  {empresasComFiliais.get(empresa.id) &&
                    (empresasComFiliais.get(empresa.id) ?? []).length > 0 && (
                      <div className="ml-7 space-y-2 border-l-2 border-[var(--color-border)] pl-4">
                        <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                          Filiais:
                        </div>
                        {(empresasComFiliais.get(empresa.id) ?? []).map(filial => (
                          <div key={filial.id} className="space-y-2">
                            <label className="flex items-start gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedFiliais.has(filial.id)}
                                onChange={() => toggleFilial(empresa.id, filial.id)}
                                className="mt-1 h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                              />
                              <div className="flex-1">
                                <div className="text-sm text-[var(--color-text)]">
                                  {filial.nome_fantasia}
                                </div>
                                <div className="text-xs text-[var(--color-text-secondary)]">
                                  {filial.cnpj_cpf}
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <button
            type="button"
            className="px-6 py-2 border border-[var(--color-border)] text-[var(--color-text)] rounded-md hover:bg-[var(--color-bg)] transition-colors"
            onClick={handleCancel}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </div>
      </form>
    </div>
  );
};
