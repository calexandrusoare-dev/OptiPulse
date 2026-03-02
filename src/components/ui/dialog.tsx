import React, { PropsWithChildren, HTMLAttributes } from 'react';

export const Dialog: React.FC<PropsWithChildren<{ open?: boolean; onOpenChange?: (open: boolean) => void } & HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const DialogContent: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const DialogHeader: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const DialogFooter: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
export const DialogTitle: React.FC<PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>> = ({ children, ...props }) => (
  <h2 {...props}>{children}</h2>
);
export const DialogDescription: React.FC<PropsWithChildren<HTMLAttributes<HTMLParagraphElement>>> = ({ children, ...props }) => (
  <p {...props}>{children}</p>
);
export const DialogTrigger: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);
