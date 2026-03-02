import React from 'react';

export const Progress: React.FC<{
  value?: number;
  className?: string;
  indicatorClassName?: string;
}> = ({ value = 0, className, indicatorClassName }) => (
  <div className={className} style={{ background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
    <div
      className={indicatorClassName}
      style={{ width: `${value}%`, height: '100%' }}
    />
  </div>
);
