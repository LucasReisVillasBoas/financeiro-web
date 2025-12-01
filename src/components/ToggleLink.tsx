import React from 'react';

interface ToggleLinkProps {
  text: string;
  actionText: string;
  onClick: () => void;
}

export const ToggleLink: React.FC<ToggleLinkProps> = ({ text, actionText, onClick }) => {
  return (
    <div className="mt-4 text-center text-sm text-[var(--color-text-secondary)]">
      {text}{' '}
      <button
        className="text-[var(--color-primary)] hover:text-[var(--color-link-hover)] font-medium"
        onClick={onClick}
      >
        {actionText}
      </button>
    </div>
  );
};
