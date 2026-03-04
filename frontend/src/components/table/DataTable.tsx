import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  emptyMessage?: string;
};

function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No hay datos para mostrar.",
}: DataTableProps<T>) {
  return (
    <table className="data-table">
      <thead className="data-table-header">
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.header}</th>
          ))}
        </tr>
      </thead>
      <tbody className="data-table-body">
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="table-empty-cell">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td key={`${column.key}-${rowKey(row)}`}>{column.render(row)}</td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default DataTable;
