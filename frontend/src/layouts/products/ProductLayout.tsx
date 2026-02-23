import { IoSearch, IoReload } from "react-icons/io5";
import { useProductos } from "../../hooks/useProducts";

import formatDate from "../../utils/normalize"

function ProductLayout() {
    const { productos, loading, error, reload } = useProductos();
    console.log(productos)

    return (
        <div>
            <button onClick={reload} disabled={loading}>
            {loading ? <IoSearch className="icon-spin" /> : <IoReload />}
            </button>
            {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

            <div>
            {productos.map((p) => (
                <ul>
                <li>{p.nombre}</li>
                <li>{p.precio}</li>
                <li>{p.stock_actual}</li>
                <li>{p.fecha_agregado}</li>
                <li>{p.fecha_caducidad}</li>
                <li>{formatDate(p.created_at)}</li>
                <li>{formatDate(p.updated_at)}</li>
                <li>{p.Id_categoria_PK}</li>
                </ul>
            ))}
            </div>
        </div>
    );
}

export default ProductLayout;
