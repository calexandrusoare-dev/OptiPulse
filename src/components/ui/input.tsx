import React, { InputHTMLAttributes } from 'react';

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} />
);
