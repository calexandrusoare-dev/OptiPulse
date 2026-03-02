import React, { PropsWithChildren, HTMLAttributes } from 'react';

export const Table: React.FC<PropsWithChildren<HTMLAttributes<HTMLTableElement>>> = ({ children, ...props }) => (
  <table {...props}>{children}</table>
);
export const TableHeader: React.FC<PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>> = ({ children, ...props }) => (
  <thead {...props}>{children}</thead>
);
export const TableBody: React.FC<PropsWithChildren<HTMLAttributes<HTMLTableSectionElement>>> = ({ children, ...props }) => (
  <tbody {...props}>{children}</tbody>
);
export const TableRow: React.FC<PropsWithChildren<HTMLAttributes<HTMLTableRowElement>>> = ({ children, ...props }) => (
  <tr {...props}>{children}</tr>
);
export const TableHead: React.FC<PropsWithChildren<HTMLAttributes<HTMLTableHeaderCellElement>>> = ({ children, ...props }) => (
  <th {...props}>{children}</th>
);
export const TableCell: React.FC<PropsWithChildren<HTMLAttributes<HTMLTableCellElement>>> = ({ children, ...props }) => (
  <td {...props}>{children}</td>
);
