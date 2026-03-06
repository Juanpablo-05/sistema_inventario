import ModalCreateProducts from "../../components/modals/products/ModalCreateProducts";
import ModalEditProducts from "../../components/modals/products/ModalEditProducts";
import ModalDeleteProducts from "../../components/modals/products/ModalDeleteProducts";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import HeaderPages from "../../components/HeaderPages";

import { useProductos } from "../../hooks/products/useProducts";
import { formatDate } from "../../utils/normalize";
import { useApi } from "../../context/ApiContext";

import "../../css/products/products_layout.css";
import "../../css/table/shared_table.css";

const CADUCIDAD_CATEGORY_KEYWORDS = ["alimentos", "belleza"];

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function requiresCaducidadByCategoryName(categoryName: string): boolean {
  const normalized = normalizeText(categoryName);
  return CADUCIDAD_CATEGORY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function ProductLayout() {
  const { productos, loading, error, reload, createProduct, updateProduct, deleteProduct } = useProductos();
  const { user } = useApi();
  const isAdmin = user?.role === "admin";

  const columns: DataTableColumn<(typeof productos)[number]>[] = [
    {
      key: "nombre_p",
      header: "Nombre",
      render: (p) => p.nombre_p,
    },
    {
      key: "precio_p",
      header: "Precio",
      render: (p) => p.precio_p,
    },
    {
      key: "fecha_agregado_p",
      header: "Fecha Agregado",
      render: (p) => formatDate(p.fecha_agregado_p),
    },
    {
      key: "fecha_caducidad_p",
      header: "Fecha Caducidad",
      render: (p) => (requiresCaducidadByCategoryName(p.nombre) ? formatDate(p.fecha_caducidad_p) : "N/A"),
    },
    {
      key: "stock_actual",
      header: "Stock",
      render: (p) => p.stock_actual,
    },
    {
      key: "created_at_p",
      header: "Fech Creacion",
      render: (p) => formatDate(p.created_at_p),
    },
    {
      key: "updated_at_p",
      header: "Fech Edicion",
      render: (p) => formatDate(p.updated_at_p),
    },
    {
      key: "nombre",
      header: "Categoria",
      render: (p) => p.nombre,
    },
    ...(isAdmin
      ? [
          {
            key: "acciones",
            header: "Acciones",
            render: (p: (typeof productos)[number]) => (
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: "center",
                }}
              >
                <ModalEditProducts producto={p} onEdit={updateProduct} />
                <ModalDeleteProducts id={p.id_p} nombre={p.nombre_p} onDelete={deleteProduct} />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className="container_product-layout">
      <HeaderPages
        title="Productos"
        onReload={reload}
        loading={loading}
        createAction={<ModalCreateProducts onCreate={createProduct} />}
        headerClassName="container_product-header"
        actionsClassName="container_product-header-btns"
      />

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <div className="table_products">
        <DataTable
          rows={productos}
          columns={columns}
          rowKey={(p) => p.id_p}
          emptyMessage="No hay productos registrados."
        />
      </div>
    </div>
  );
}

export default ProductLayout;
