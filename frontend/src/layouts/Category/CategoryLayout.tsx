import { useCategorias } from "../../hooks/useCategorias";
import { IoReload, IoSearch } from "react-icons/io5";

import ModalDelete from "../../components/modals/category/ModalDelete";
import ModalCreate from "../../components/modals/category/ModalCreate";
import ModalEdit from "../../components/modals/category/ModalEdit";

import formatDate from "../../utils/normalize";

import '../../css/category/category_layout.css'

function CategoryLayout() {
  const { categorias, loading, error, reload, createCategoria, deleteCategoria, updateCategoria } = useCategorias();

  return (
    <div className="container_category-layout">
      <div className="container_category-header">
        <h2>Categorías</h2>
        <div className="container_category-header-btns">
          <ModalCreate onCreate={createCategoria} />

          <button onClick={reload} disabled={loading} className="btn_reload">
            {loading ? <IoSearch className="icon-spin" /> : <IoReload />}
          </button>
        </div>
      </div>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <div className="table_category">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Fecha de creación</th>
              <th>Fecha de edición</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categorias.map((categoria) => (
              <tr key={categoria.id}>
                <td>{categoria.nombre}</td>
                <td>{categoria.descripcion || "-"}</td>
                <td>{categoria.estado}</td>
                <td>{formatDate(categoria.createdAt)}</td>
                <td>{formatDate(categoria.updatedAt)}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <ModalEdit categoria={categoria} onEdit={updateCategoria} />
                    <ModalDelete id={categoria.id} onDelete={deleteCategoria} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CategoryLayout
