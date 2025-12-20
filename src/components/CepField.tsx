import React, { useState } from 'react';
import { cepService, CepData } from '../services/cep.service';

interface CepFieldProps {
  value: string;
  onChange: (cep: string) => void;
  onAddressFound: (data: CepData) => void;
  required?: boolean;
  disabled?: boolean;
}

export const CepField: React.FC<CepFieldProps> = ({
  value,
  onChange,
  onAddressFound,
  required = false,
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);

  const formatCep = (val: string) => {
    const numbers = val.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{0,3})/, '$1-$2').replace(/-$/, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCep(e.target.value);
    onChange(formatted);
  };

  const handleBlur = async () => {
    const cepNumbers = value.replace(/\D/g, '');
    if (cepNumbers.length === 8) {
      setLoading(true);
      const data = await cepService.buscar(cepNumbers);
      if (data) {
        onAddressFound(data);
      }
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <label
        htmlFor="cep"
        className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
      >
        CEP
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id="cep"
        name="cep"
        type="text"
        placeholder="00000-000"
        maxLength={9}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled || loading}
        className="w-full px-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder-[var(--color-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition disabled:opacity-50"
      />
      {loading && (
        <div className="absolute right-3 top-9">
          <div className="animate-spin h-4 w-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
        </div>
      )}
    </div>
  );
};
