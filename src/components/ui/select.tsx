import React, { PropsWithChildren, HTMLAttributes } from 'react';

export const Select: React.FC<PropsWithChildren<{ value?: string; onValueChange?: (val: string) => void } & HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const SelectTrigger: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const SelectContent: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const SelectItem: React.FC<PropsWithChildren<{ value?: string } & HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const SelectValue: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
