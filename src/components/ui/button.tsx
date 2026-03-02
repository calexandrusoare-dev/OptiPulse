import React, { ButtonHTMLAttributes, PropsWithChildren } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string;
  size?: string;
  className?: string;
}

export const Button: React.FC<PropsWithChildren<ButtonProps>> = ({ children, className, ...props }) => (
  <button className={className} {...props}>
    {children}
  </button>
);
