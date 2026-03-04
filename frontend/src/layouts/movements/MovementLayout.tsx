import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import HeaderPages from "../../components/HeaderPages";

import { useMovements } from "../../hooks/useMovements";
import { formatDate } from "../../utils/normalize";

import "../../css/movement_layout.css";
import "../../css/table/shared_table.css";

function MovementLayout() {
  const { movements, loading, error, reload } = useMovements();

  const columns: DataTableColumn<(typeof movements)[number]>[] = [
    {
      key: "id",
      header: "ID",
      render: (movement) => movement.id,
    },
    {
      key: "Id_Produ_PK",
      header: "ID Producto",
      render: (movement) => movement.Id_Produ_PK,
    },
    {
      key: "tipo",
      header: "Tipo",
      render: (movement) =>
        movement.tipo === "entrada"
          ? "Entrada"
          : movement.tipo === "salida"
            ? "Salida"
            : "Ajuste",
    },
    {
      key: "cantidad",
      header: "Cantidad",
      render: (movement) => movement.cantidad,
    },
    {
      key: "stock_anterior",
      header: "Stock Anterior",
      render: (movement) => movement.stock_anterior,
    },
    {
      key: "stock_nuevo",
      header: "Stock Nuevo",
      render: (movement) => movement.stock_nuevo,
    },
    {
      key: "diferencia",
      header: "Diferencia",
      render: (movement) => {
        const diff = movement.stock_nuevo - movement.stock_anterior;
        return diff > 0 ? `+${diff}` : diff;
      },
    },
    {
      key: "fecha_movimiento",
      header: "Fecha",
      render: (movement) => formatDate(movement.fecha_movimiento),
    },
    {
      key: "motivo",
      header: "Motivo",
      render: (movement) => movement.motivo,
    },
  ];

  return (
    <div className="container_movement-layout">
      <HeaderPages
        title="Movimientos"
        onReload={reload}
        loading={loading}
        headerClassName="container_movement-header"
        actionsClassName="container_movement-header-btns"
      />

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <div className="table_movements">
        <DataTable
          rows={movements}
          columns={columns}
          rowKey={(movement) => movement.id}
          emptyMessage="No hay movimientos registrados."
        />
      </div>
    </div>
  );
}

export default MovementLayout;
