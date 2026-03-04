import ModalDelete from "../../components/modals/category/ModalDelete";
import ModalCreate from "../../components/modals/category/ModalCreate";
import ModalEdit from "../../components/modals/category/ModalEdit";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import HeaderPages from "../../components/HeaderPages";

import { formatDate } from "../../utils/normalize";
import { useCategorias } from "../../hooks/useCategorias";
import { useApi } from "../../context/ApiContext";

import "../../css/category/category_layout.css";
import "../../css/table/shared_table.css";

function CategoryLayout() {
  const { categorias, loading, error, reload, createCategoria, deleteCategoria, updateCategoria } =
    useCategorias();

  const { user } = useApi();
  const isAdmin = user?.role === "admin";

  const columns: DataTableColumn<(typeof categorias)[number]>[] = [
    {
      key: "nombre",
      header: "Nombre",
      render: (categoria) => categoria.nombre,
    },
    {
      key: "descripcion",
      header: "Descripción",
      render: (categoria) => categoria.descripcion || "-",
    },
    {
      key: "estado",
      header: "Estado",
      render: (categoria) => categoria.estado,
    },
    {
      key: "createdAt",
      header: "Fecha de creación",
      render: (categoria) => formatDate(categoria.createdAt),
    },
    {
      key: "updatedAt",
      header: "Fecha de edición",
      render: (categoria) => formatDate(categoria.updatedAt),
    },
    ...(isAdmin
      ? [
          {
            key: "acciones",
            header: "Acciones",
            render: (categoria: (typeof categorias)[number]) => (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                <ModalEdit categoria={categoria} onEdit={updateCategoria} />
                <ModalDelete id={categoria.id} onDelete={deleteCategoria} />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="container_category-layout">
      <HeaderPages
        title="Categorías"
        onReload={reload}
        loading={loading}
        createAction={<ModalCreate onCreate={createCategoria} />}
        headerClassName="container_category-header"
        actionsClassName="container_category-header-btns"
      />

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <div className="table_category">
        <DataTable
          rows={categorias}
          columns={columns}
          rowKey={(categoria) => categoria.id}
          emptyMessage="No hay categorías registradas."
        />
      </div>
    </div>
  );
}

export default CategoryLayout;
