import React from "react";

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="w-full bg-[var(--color-surface)] dark:bg-[var(--color-bg)] p-4 shadow flex items-center justify-between">
      <h1 className="text-2xl font-semibold text-[var(--color-text-primary)]">
        {title}
      </h1>
      {/* Aqui você pode colocar avatar, notifications, etc */}
    </header>
  );
};
