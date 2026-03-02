import React, { PropsWithChildren } from 'react';

export const Badge: React.FC<PropsWithChildren<{ className?: string; variant?: string }>> = ({ children, className }) => (
  <span className={className}>{children}</span>
);
