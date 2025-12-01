import React from 'react';

interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  id: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  id,
  name,
  value,
  defaultValue,
  onChange,
  required = false,
  disabled = false,
}) => {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-1 text-[var(--color-text-primary)]"
      >
        {label}
      </label>
      <input
        id={id}
        name={name || id}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2 rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder-[var(--color-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] transition"
      />
    </div>
  );
};
