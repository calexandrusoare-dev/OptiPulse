import React, { PropsWithChildren, HTMLAttributes } from 'react';

export const Tabs: React.FC<PropsWithChildren<{ className?: string; defaultValue?: string }>> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

export const TabsList: React.FC<PropsWithChildren<HTMLAttributes<HTMLDivElement>>> = ({ children, ...props }) => (
  <div {...props}>{children}</div>
);

export const TabsTrigger: React.FC<PropsWithChildren<{ value?: string; className?: string }>> = ({ children, className, ...props }) => (
  <button className={className} {...props} type="button">
    {children}
  </button>
);

export const TabsContent: React.FC<PropsWithChildren<{ value?: string; className?: string }>> = ({ children, className, ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);
