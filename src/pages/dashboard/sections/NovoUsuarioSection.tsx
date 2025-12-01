import React, { useState, useEffect } from 'react';
import { InputField } from '../../../components/InputField';
import { usuarioService } from '../../../services/usuario.service';
import { empresaService } from '../../../services/empresa.service';
import { perfilService } from '../../../services/perfil.service';
import type { UsuarioCreateDto } from '../../../services/usuario.service';
import type { Empresa, Filial } from '../../../types/api.types';

interface NovoUsuarioSectionProps {
  onNavigate: (section: string) => void;
}

export const NovoUsuarioSection: React.FC<NovoUsuarioSectionProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [telefone, setTelefone] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresasComFiliais, setEmpresasComFiliais] = useState<Map<string, Filial[]>>(new Map());
  const [selectedEmpresas, setSelectedEmpresas] = useState<Set<string>>(new Set());
  const [selectedFiliais, setSelectedFiliais] = useState<Set<string>>(new Set());
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingEmpresas(true);
        const user = await usuarioService.getById();
        if (!user) {
          throw new Error('Usuário não encontrado');
        }

        const empresasList = await empresaService.findByCliente(user.id);
        setEmpresas(empresasList.filter(emp => !emp.sede));

        const filiaisMap = new Map<string, Filial[]>();
        for (const empresa of empresasList.filter(emp => !emp.sede)) {
          const filiais = await empresaService.listFiliais(empresa.id);
          filiaisMap.set(empresa.id, filiais);
        }
        setEmpresasComFiliais(filiaisMap);
      } catch (err: any) {
        console.error('Erro ao carregar dados:', err);
        setError('Erro ao carregar empresas, filiais e perfis');
      } finally {
        setLoadingEmpresas(false);
      }
    };

    fetchData();
  }, []);

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

    const perfilNome = formData.get('perfil') as string;

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
      const associacoes: Promise<any>[] = [];

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

      const perfil = await perfilService.create({
        clienteId: novoUsuario.id,
        nome: perfilNome,
        permissoes: {
          usuarios: ['visualizar'],
          empresas: ['visualizar'],
          relatorios: ['visualizar'],
        },
      });
      setSuccess('Usuário cadastrado e associado com sucesso!');
      form.reset();
      setTelefone('');
      setSelectedEmpresas(new Set());
      setSelectedFiliais(new Set());

      setTimeout(() => {
        onNavigate('usuarios-listar');
      }, 2000);
    } catch (err: any) {
      console.error('Erro ao cadastrar usuário:', err);
      setError(err.message || 'Erro ao cadastrar usuário');
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
          />
          <InputField id="cargo" label="Cargo" type="text" placeholder="Digite o cargo" />
          <InputField
            id="perfil"
            label="Perfil"
            type="text"
            placeholder="Ex: Editor, Visualizador, Administrador"
            required
          />
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
                      <div className="text-sm text-white">
                        {empresa.razao_social} - {empresa.cnpj_cpf}
                      </div>
                    </div>
                  </label>

                  {empresasComFiliais.get(empresa.id) &&
                    empresasComFiliais.get(empresa.id)!.length > 0 && (
                      <div className="ml-7 space-y-2 border-l-2 border-[var(--color-border)] pl-4">
                        <div className="text-sm font-medium text-white">Filiais:</div>
                        {empresasComFiliais.get(empresa.id)!.map(filial => (
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
                                <div className="text-xs text-white">{filial.cnpj_cpf}</div>
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
