import React, { useState } from 'react';
import { InputField } from '../../../components/InputField';
import { SelectField, ESTADOS_BRASIL } from '../../../components/SelectField';
import { CepField } from '../../../components/CepField';
import { empresaService } from '../../../services/empresa.service';
import type { CreateEmpresaDto } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import { contatoService } from '../../../services/contato.service';
import { cidadeService } from '../../../services/cidade.service';
import { usuarioService } from '../../../services/usuario.service';
import { perfilService } from '../../../services/perfil.service';
import type { CepData } from '../../../services/cep.service';

interface NovaSedeSecionProps {
  onNavigate: (section: string) => void;
}

export const NovaSedeSection: React.FC<NovaSedeSecionProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bacen, setBacen] = useState('');
  const { getClienteId } = useAuth();

  // Estado para campos de endereço
  const [endereco, setEndereco] = useState({
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
    ibge: '',
  });

  const handleEnderecoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setEndereco(prev => ({ ...prev, [id]: value }));
  };

  const handleEstadoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEndereco(prev => ({ ...prev, uf: e.target.value }));
  };

  const handleAddressFound = (data: CepData) => {
    setEndereco(prev => ({
      ...prev,
      logradouro: data.logradouro || prev.logradouro,
      bairro: data.bairro || prev.bairro,
      cidade: data.cidade || prev.cidade,
      uf: data.uf || prev.uf,
      ibge: data.ibge || prev.ibge,
    }));
  };

  const handleCancel = () => {
    onNavigate('empresas-listar');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    const clienteId = getClienteId();
    if (!clienteId) {
      setError('Erro ao obter informações do usuário. Faça login novamente.');
      setLoading(false);
      return;
    }

    const dto: CreateEmpresaDto = {
      cliente_id: clienteId,
      razao_social: formData.get('razao-social') as string,
      nome_fantasia: formData.get('nome-fantasia') as string,
      cnpj_cpf: formData.get('cnpj') as string,
      inscricao_estadual: formData.get('inscricao-estadual') as string,
      cep: endereco.cep.replace(/\D/g, ''),
      logradouro: endereco.logradouro,
      numero: formData.get('numero') as string,
      complemento: formData.get('complemento') as string,
      bairro: endereco.bairro,
      cidade: endereco.cidade,
      uf: endereco.uf,
      telefone: formData.get('telefone') as string,
      celular: formData.get('celular') as string,
      email: formData.get('email') as string,
      codigo_ibge: endereco.ibge,
      data_abertura: formData.get('data-abertura')
        ? new Date(formData.get('data-abertura') as string)
        : undefined,
    };

    try {
      const perfil = await perfilService.findAll(clienteId);
      if (perfil.length !== 0 && perfil.map(p => p.nome).includes('Administrador') === false) {
        setError('Perfil "Administrador" não encontrado. Contate o suporte.');
        setLoading(false);
        return;
      }
      if (perfil.length === 0) {
        await perfilService.create({
          clienteId: clienteId,
          nome: 'Administrador',
          permissoes: {
            usuarios: ['criar', 'editar', 'listar'],
            relatorios: ['criar', 'editar', 'listar'],
            empresas: ['criar', 'editar', 'listar'],
          },
        });
      }

      const empresa = await empresaService.create(dto);

      await contatoService.create({
        clienteId: clienteId,
        filialId: empresa.id,
        funcao: 'Contato Principal',
        celular: dto.celular || '',
        nome: dto.nome_fantasia,
        email: dto.email || '',
        telefone: dto.telefone || '',
      });

      await cidadeService.create({
        clienteId: clienteId,
        filialId: empresa.id,
        codigoIbge: endereco.ibge,
        uf: dto.uf || '',
        pais: 'Brasil',
        nome: dto.cidade || '',
        codigoBacen: bacen || '',
      });

      await usuarioService.associarEmpresaFilial(clienteId, {
        empresaId: empresa.id,
      });

      setSuccess('Empresa (sede) cadastrada com sucesso!');
      setBacen('');
      setEndereco({ cep: '', logradouro: '', bairro: '', cidade: '', uf: '', ibge: '' });
      form.reset();

      setTimeout(() => {
        onNavigate('empresas-listar');
      }, 2000);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao cadastrar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleBacenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBacen(e.target.value);
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
            id="razao-social"
            label="Razão Social"
            type="text"
            placeholder="Digite a razão social"
            required
          />
          <InputField
            id="nome-fantasia"
            label="Nome Fantasia"
            type="text"
            placeholder="Digite o nome fantasia"
            required
          />
          <InputField
            id="cnpj"
            label="CNPJ"
            type="text"
            placeholder="00.000.000/0000-00"
            required
          />
          <InputField
            id="inscricao-estadual"
            label="Inscrição Estadual"
            type="text"
            placeholder="Digite a IE"
          />
          <InputField
            id="data-abertura"
            label="Data de Abertura"
            type="date"
            placeholder="dd/mm/aaaa"
          />
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CepField
              value={endereco.cep}
              onChange={cep => setEndereco(prev => ({ ...prev, cep }))}
              onAddressFound={handleAddressFound}
            />
            <InputField
              id="logradouro"
              label="Logradouro"
              type="text"
              placeholder="Rua, Avenida..."
              value={endereco.logradouro}
              onChange={handleEnderecoChange}
            />
            <InputField id="numero" label="Número" type="text" placeholder="Nº" />
            <InputField
              id="complemento"
              label="Complemento"
              type="text"
              placeholder="Apto, Sala..."
            />
            <InputField
              id="bairro"
              label="Bairro"
              type="text"
              placeholder="Digite o bairro"
              value={endereco.bairro}
              onChange={handleEnderecoChange}
            />
            <InputField
              id="cidade"
              label="Cidade"
              type="text"
              placeholder="Digite a cidade"
              value={endereco.cidade}
              onChange={handleEnderecoChange}
            />
            <SelectField
              id="uf"
              label="Estado"
              placeholder="Selecione o estado"
              options={ESTADOS_BRASIL}
              value={endereco.uf}
              onChange={handleEstadoChange}
            />
            <InputField
              id="ibge"
              label="Código IBGE"
              placeholder="Digite o código IBGE"
              value={endereco.ibge}
              onChange={handleEnderecoChange}
            />
            <InputField
              id="codigo-bacen"
              label="Código BACEN"
              placeholder="Digite o código BACEN"
              value={bacen}
              onChange={handleBacenChange}
            />
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Contato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField id="telefone" label="Telefone" type="tel" placeholder="(00) 0000-0000" />
            <InputField id="celular" label="Celular" type="tel" placeholder="(00) 0000-0000" />
            <InputField id="email" label="E-mail" type="email" placeholder="empresa@email.com" />
          </div>
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
            {loading ? 'Cadastrando...' : 'Cadastrar Sede'}
          </button>
        </div>
      </form>
    </div>
  );
};
