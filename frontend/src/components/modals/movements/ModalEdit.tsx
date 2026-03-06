import { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IoCreateOutline } from "react-icons/io5";
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";
import { toDateInputValue } from "../../../utils/normalize";
import { useProductos } from "../../../hooks/products/useProducts";
import type { UpdateMovementInput } from "../../../hooks/movements/types/TypesMovements";

type MovementType = "entrada" | "salida" | "ajuste";

type Movement = {
  id: number;
  Id_Produ_PK: number;
  tipo: MovementType;
  cantidad: number;
  fecha_movimiento: string;
  motivo: string;
};

type ModalEditProps = {
  movement: Movement;
  onEdit: (id: number, input: UpdateMovementInput) => Promise<void>;
};

function ModalEdit({ movement, onEdit }: ModalEditProps) {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [productoId, setProductoId] = useState("");
  const [tipo, setTipo] = useState<MovementType>("entrada");
  const [cantidad, setCantidad] = useState("");
  const [fechaMovimiento, setFechaMovimiento] = useState("");
  const [motivo, setMotivo] = useState("");

  const { productos, loading: loadingProducts } = useProductos();

  const productOptions = useMemo(
    () =>
      productos.map((producto) => ({
        id: producto.id_p,
        label: `${producto.id_p} - ${producto.nombre_p}`,
      })),
    [productos],
  );

  useEffect(() => {
    if (!show) return;

    setProductoId(String(movement.Id_Produ_PK ?? ""));
    setTipo(movement.tipo ?? "entrada");
    setCantidad(String(movement.cantidad ?? ""));
    setFechaMovimiento(toDateInputValue(movement.fecha_movimiento));
    setMotivo(movement.motivo ?? "");
  }, [show, movement]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const formId = `edit-movement-form-${movement.id}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const productoIdNum = Number(productoId);
    const cantidadNum = Number(cantidad);
    const motivoTrim = motivo.trim();

    if (Number.isNaN(productoIdNum) || productoIdNum <= 0) {
      await showErrorAlert(new Error("Selecciona un producto válido"), "Validación");
      return;
    }
    if (!Number.isInteger(cantidadNum) || cantidadNum <= 0) {
      await showErrorAlert(new Error("La cantidad debe ser un entero mayor que cero"), "Validación");
      return;
    }
    if (!fechaMovimiento) {
      await showErrorAlert(new Error("La fecha de movimiento es obligatoria"), "Validación");
      return;
    }
    if (!motivoTrim) {
      await showErrorAlert(new Error("El motivo es obligatorio"), "Validación");
      return;
    }

    setSaving(true);
    try {
      await onEdit(movement.id, {
        Id_producto_PK: productoIdNum,
        tipo,
        cantidad: cantidadNum,
        fecha_movimiento: fechaMovimiento,
        motivo: motivoTrim,
      });
      handleClose();
      await showSuccessAlert("Movimiento actualizado", "Los cambios se guardaron correctamente.");
    } catch (error) {
      await showErrorAlert(error, "No se pudo actualizar el movimiento");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="warning" onClick={handleShow}>
        <IoCreateOutline color="black" size={18} />
      </Button>

      <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Editar movimiento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id={formId} onSubmit={handleSubmit} className="form_create-category">
            <label htmlFor={`${formId}-producto`}>Producto</label>
            <select
              id={`${formId}-producto`}
              value={productoId}
              onChange={(e) => setProductoId(e.target.value)}
              required
              disabled={loadingProducts || saving}
            >
              <option value="">Selecciona un producto</option>
              {productOptions.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.label}
                </option>
              ))}
            </select>

            <label htmlFor={`${formId}-tipo`}>Tipo de movimiento</label>
            <select
              id={`${formId}-tipo`}
              value={tipo}
              onChange={(e) => setTipo(e.target.value as MovementType)}
              required
              disabled={saving}
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>

            <label htmlFor={`${formId}-cantidad`}>Cantidad</label>
            <input
              id={`${formId}-cantidad`}
              type="number"
              min="1"
              step="1"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
              required
              disabled={saving}
            />

            <label htmlFor={`${formId}-fecha`}>Fecha de movimiento</label>
            <input
              id={`${formId}-fecha`}
              type="date"
              value={fechaMovimiento}
              onChange={(e) => setFechaMovimiento(e.target.value)}
              required
              disabled={saving}
            />

            <label htmlFor={`${formId}-motivo`}>Motivo</label>
            <input
              id={`${formId}-motivo`}
              type="text"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Describe el motivo del movimiento"
              required
              disabled={saving}
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={saving || loadingProducts} variant="warning">
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEdit;
