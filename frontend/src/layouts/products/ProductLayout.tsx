import { IoSearch, IoReload } from "react-icons/io5";
import { useProductos } from "../../hooks/useProducts";
import ModalCreateProducts from "../../components/modals/products/ModalCreateProducts";
import ModalEditProducts from "../../components/modals/products/ModalEditProducts";
import ModalDeleteProducts from "../../components/modals/products/ModalDeleteProducts";

import formatDate from "../../utils/normalize"

import '../../css/products/products_layout.css'

function ProductLayout() {
    const { productos, loading, error, reload, createProduct, updateProduct, deleteProduct } = useProductos();

    return (
        <div className="container_product-layout">
            <div className="container_product-header">
                <h2>Productos</h2>
                <div className="container_product-header-btns">
                    <ModalCreateProducts onCreate={createProduct} />
                    <button onClick={reload} disabled={loading} className="btn_reload">
                        {loading ? <IoSearch className="icon-spin" /> : <IoReload />}
                    </button>
                </div>
            </div>
            {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

            <div className="table_products">
            <table>
                <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Precio</th>
                    <th>Fecha Agregado</th>
                    <th>Fecha Caducidad</th>
                    <th>Stock</th>
                    <th>Fech Creacion</th>
                    <th>Fech Edicion</th>
                    <th>Categoria</th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                {productos.map((p) => (
                    <tr key={p.id_p}>
                    <td>{p.nombre_p}</td>
                    <td>{p.precio_p}</td>
                    <td>{formatDate(p.fecha_agregado_p)}</td>
                    <td>{formatDate(p.fecha_caducidad_p)}</td>
                    <td>{p.stock_actual}</td>
                    <td>{formatDate(p.created_at_p)}</td>
                    <td>{formatDate(p.updated_at_p)}</td>
                        <td>{p.nombre}</td>
                        <td>
                            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                                <ModalEditProducts producto={p} onEdit={updateProduct} />
                                <ModalDeleteProducts
                                    id={p.id_p}
                                    nombre={p.nombre_p}
                                    onDelete={deleteProduct}
                                />
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
    );
}

export default ProductLayout;
