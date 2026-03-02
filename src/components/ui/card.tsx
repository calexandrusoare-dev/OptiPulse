import React, { PropsWithChildren } from 'react';

export const Card: React.FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const CardHeader: React.FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const CardContent: React.FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const CardTitle: React.FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <h3 className={className}>{children}</h3>
);
