import { useEffect, useMemo } from "react";
import HeaderPages from "../../../components/HeaderPages";
import DataTable, { type DataTableColumn } from "../../../components/table/DataTable";

import { useBilling } from "../../../hooks/billing/useBilling";
import { formatDate } from "../../../utils/normalize";
import { useUsers } from "../../../hooks/users/useUsers";

import '../../../css/billing/billing_admin.css';


function BillingAdminLayout() {
    const { billings, reload, loading } = useBilling();
    const { currentUsers, fetchAllUsers } = useUsers();

    useEffect(() => {
        void fetchAllUsers();
    }, [fetchAllUsers]);

    const userById = useMemo(
        () => new Map(currentUsers.map((user) => [user.id, user])),
        [currentUsers],
    );
    
    const colums: DataTableColumn<(typeof billings)[number]>[] = [
        {
            key: "numeroFactura",
            header: "Número de Factura",
            render: (billing) => billing.numero_factura,
        },
        {
            key: 'usuario',
            header: 'Usuario',
            render: (billing) => {
                const user = userById.get(billing.usuario_id);
                return user?.nombre ?? user?.username ?? "Desconocido";
            }
        },
        {
            key: 'cliente',
            header: 'Cliente',
            render: (billing) => billing.cliente_nombre
        },
        {
            key: 'clienteId',
            header: 'Cliente ID',
            render: (billing) => billing.cliente_documento
        },
        {
            key: 'subtotal',
            header: 'Subtotal',
            render: (billing) => billing.subtotal.toFixed(2)
        },
        {
            key: 'impuestos',
            header: 'Impuestos',
            render: (billing) => billing.impuesto.toFixed(2)
        },
        {
            key: 'total',
            header: 'Total',
            render: (billing) => billing.total.toFixed(2)
        },
        {
            key: 'estado',
            header: 'Estado',
            render: (billing) => billing.estado
        },
        {
            key: 'fecha',
            header: 'Fecha',
            render: (billing) => formatDate(billing.fecha_emision)
        }
    ];

  return (
    <div className="container_billing-layout">
      <HeaderPages
        title={"Facturación"}
        onReload={reload}
        loading={loading}
        headerClassName="container_billing-header"
        actionsClassName="container_billing-header-btns"
      />
      <div className="table_billing">
        <DataTable
          rows={billings}
          columns={colums}
          rowKey={(billing) => billing.id}
          emptyMessage="No hay facturas registradas"
        />
      </div>
    </div>
  );
}

export default BillingAdminLayout
