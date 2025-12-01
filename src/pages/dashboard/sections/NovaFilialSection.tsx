import React, { useState } from 'react';
import { InputField } from '../../../components/InputField';
import { empresaService } from '../../../services/empresa.service';
import type { CreateFilialDto } from '../../../types/api.types';
import { useAuth } from '../../../context/AuthContext';
import { contatoService } from '../../../services/contato.service';
import { cidadeService } from '../../../services/cidade.service';
import { usuarioService } from '../../../services/usuario.service';
import { perfilService } from '../../../services/perfil.service';

interface NovaFilialSectionProps {
  onNavigate: (section: string) => void;
}

export const NovaFilialSection: React.FC<NovaFilialSectionProps> = ({ onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [bacen, setBacen] = useState('');
  const { getClienteId } = useAuth();

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

    const cnpjSede = formData.get('cnpj-sede') as string;
    const sede = await empresaService.findByDocument(cnpjSede);

    const dto: CreateFilialDto = {
      cliente_id: clienteId,
      empresa_id: sede.id,
      razao_social: formData.get('razao-social') as string,
      nome_fantasia: formData.get('nome-fantasia') as string,
      cnpj_cpf: formData.get('cnpj') as string,
      inscricao_estadual: formData.get('inscricao-estadual') as string,
      cep: formData.get('cep') as string,
      logradouro: formData.get('logradouro') as string,
      numero: formData.get('numero') as string,
      complemento: formData.get('complemento') as string,
      bairro: formData.get('bairro') as string,
      cidade: formData.get('cidade') as string,
      uf: formData.get('estado') as string,
      telefone: formData.get('telefone') as string,
      celular: formData.get('celular') as string,
      email: formData.get('email') as string,
      codigo_ibge: formData.get('ibge') as string,
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
      const empresa = await empresaService.createFilial(sede.id, dto);
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
        codigoIbge: formData.get('ibge') as string,
        uf: dto.uf || '',
        pais: 'Brasil',
        nome: dto.cidade || '',
        codigoBacen: bacen || '',
      });
      await usuarioService.associarEmpresaFilial(clienteId, {
        filialId: empresa.id,
      });
      setSuccess('Filial cadastrada com sucesso!');
      setBacen('');
      form.reset();
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar filial');
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
            id="cnpj-sede"
            label="CNPJ Sede"
            type="text"
            placeholder="00.000.000/0000-00"
          />
          <InputField
            id="razao-social"
            label="Razão Social"
            type="text"
            placeholder="Digite a razão social"
          />
          <InputField
            id="nome-fantasia"
            label="Nome Fantasia"
            type="text"
            placeholder="Digite o nome fantasia"
          />
          <InputField id="cnpj" label="CNPJ" type="text" placeholder="00.000.000/0000-00" />
          <InputField
            id="inscricao-estadual"
            label="Inscrição Estadual"
            type="text"
            placeholder="Digite a IE"
          />
          <InputField id="data-abertura" label="Data de Abertura" type="date" placeholder="" />
        </div>

        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Endereço</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField id="cep" label="CEP" type="text" placeholder="00000-000" />
            <InputField
              id="logradouro"
              label="Logradouro"
              type="text"
              placeholder="Rua, Avenida..."
            />
            <InputField id="numero" label="Número" type="text" placeholder="Nº" />
            <InputField
              id="complemento"
              label="Complemento"
              type="text"
              placeholder="Apto, Sala..."
            />
            <InputField id="bairro" label="Bairro" type="text" placeholder="Digite o bairro" />
            <InputField id="cidade" label="Cidade" type="text" placeholder="Digite a cidade" />
            <InputField id="estado" label="Estado" type="text" placeholder="UF" />
            <InputField id="ibge" label="Código IBGE" placeholder="Digite o código IBGE" />

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
            {loading ? 'Cadastrando...' : 'Cadastrar Filial'}
          </button>
        </div>
      </form>
    </div>
  );
};
