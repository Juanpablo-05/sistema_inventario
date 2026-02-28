import { useState, useEffect, useMemo } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IoCreateOutline } from "react-icons/io5";

import { useCategorias } from "../../../hooks/useCategorias";
import { toDateInputValue } from "../../../utils/normalize";
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";

type Producto = {
    id_p: number;
    nombre_p: string;
    precio_p: number;
    fecha_agregado_p: string;
    fecha_caducidad_p: string;
    stock_actual: number;
    Id_categoria_PK?: number;
    nombre: string;
}

type ModalEditProductsProps = {
    producto: Producto;
    onEdit: (id: number, input: { nombre_p?: string; precio_p?: number; fecha_agregado_p?: string; fecha_caducidad_p?: string; stock_actual?: number; Id_categoria_PK?: number; }) => Promise<void>;
}


function ModalEditProducts( { producto, onEdit }: ModalEditProductsProps) {

    const [show, setShow] = useState(false);
    const [saving, setSaving] = useState(false);
    const [nombre_p, setNombre_p] = useState("");
    const [precio_p, setPrecio_p] = useState("");
    const [fecha_agregado_p, setFecha_agregado_p] = useState("");
    const [fecha_caducidad_p, setFecha_caducidad_p] = useState("");
    const [stock_actual, setStock_actual] = useState("");
    const [categoriaId, setCategoriaId] = useState("");

    const { categorias } = useCategorias();
    const formId = `edit-product-form-${producto.id_p}`;

    const activeCategorias = useMemo(() => categorias.filter((c) => c.estado === "activo"), [categorias]);
    
    useEffect(() => {
        if (!show) return;
        setNombre_p(producto.nombre_p);
        setPrecio_p(String(producto.precio_p));
        setFecha_agregado_p(toDateInputValue(producto.fecha_agregado_p));
        setFecha_caducidad_p(toDateInputValue(producto.fecha_caducidad_p));
        setStock_actual(String(producto.stock_actual));

        const categoryIdFromProduct =
            producto.Id_categoria_PK ??
            activeCategorias.find((categoria) => categoria.nombre === producto.nombre)?.id;

        setCategoriaId(categoryIdFromProduct ? String(categoryIdFromProduct) : "");
    }, [show, producto, activeCategorias]);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const nombreTrim = nombre_p.trim();
        const precioNumber = Number(precio_p);
        const stockNumber = Number(stock_actual);
        const categoryNumber = Number(categoriaId);

        if (!nombreTrim) return;
        if (Number.isNaN(precioNumber) || precioNumber < 0) return;
        if (Number.isNaN(stockNumber) || stockNumber < 0 || !Number.isInteger(stockNumber)) return;
        if (!fecha_agregado_p || !fecha_caducidad_p) return;
        if (Number.isNaN(categoryNumber) || categoryNumber <= 0) return;

        setSaving(true);
        try {
            await onEdit(producto.id_p, {
                nombre_p: nombreTrim,
                precio_p: precioNumber,
                fecha_agregado_p,
                fecha_caducidad_p,
                stock_actual: stockNumber,
                Id_categoria_PK: categoryNumber,
            });
            handleClose();
            await showSuccessAlert("Producto actualizado", "Los cambios se guardaron correctamente.");
        }
        
        catch (error) {
            await showErrorAlert(error, "Error al actualizar el producto");
        }
        finally {
            setSaving(false);
        }
    }    

    return (
        <>
            <Button variant="warning" onClick={handleShow}>
            <IoCreateOutline color="black" size={18} />
            </Button>

            <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            >
            <Modal.Header closeButton>
                <Modal.Title>Editar Producto</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form id={formId} onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="nombre_p" className="form-label">
                    Nombre del Producto
                    </label>
                    <input
                    type="text"
                    className="form-control"
                    id="nombre_p"
                    value={nombre_p}
                    onChange={(e) => setNombre_p(e.target.value)}
                    required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="precio_p" className="form-label">
                    Precio del Producto
                    </label>
                    <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="form-control"
                    id="precio_p"
                    value={precio_p}
                    onChange={(e) => setPrecio_p(e.target.value)}
                    required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="fecha_agregado_p" className="form-label">
                    Fecha de Agregado
                    </label>
                    <input
                    type="date"
                    className="form-control"
                    id="fecha_agregado_p"
                    value={fecha_agregado_p}
                    onChange={(e) => setFecha_agregado_p(e.target.value)}
                    required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="fecha_caducidad_p" className="form-label">
                    Fecha de Caducidad
                    </label>
                    <input
                    type="date"
                    className="form-control"
                    id="fecha_caducidad_p"
                    value={fecha_caducidad_p}
                    onChange={(e) => setFecha_caducidad_p(e.target.value)}
                    required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="stock_actual" className="form-label">
                    Stock Actual
                    </label>
                    <input
                    type="number"
                    min="0"
                    step="1"
                    className="form-control"
                    id="stock_actual"
                    value={stock_actual}
                    onChange={(e) => setStock_actual(e.target.value)}
                    required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="categoria" className="form-label">
                    Categoria
                    </label>
                    <select
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(e.target.value)}
                    required
                    className="form-select"
                    >
                    <option value="">Selecciona una categoria</option>
                    {activeCategorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                        {categoria.nombre}
                        </option>
                    ))}
                    </select>
                </div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose} disabled={saving}>
                Cancelar
                </Button>
                <Button type="submit" form={formId} disabled={saving} variant="warning">
                {saving ? "Guardando..." : "Guardar cambios"}
                </Button>
            </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalEditProducts;
