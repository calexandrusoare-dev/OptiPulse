import React, { PropsWithChildren, LabelHTMLAttributes } from 'react';

export const Label: React.FC<PropsWithChildren<LabelHTMLAttributes<HTMLLabelElement>>> = ({ children, ...props }) => (
  <label {...props}>{children}</label>
);
