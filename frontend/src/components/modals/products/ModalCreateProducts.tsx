import { useMemo, useState } from "react";

import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

import { useCategorias } from "../../../hooks/category/useCategorias";
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";
import "../../../css/modals/modals.css";

type ModalCreateProductsProps = {
  onCreate: (input: {
    nombre_p: string;
    precio_p: number;
    fecha_agregado_p: string;
    fecha_caducidad_p: string | "";
    stock_actual: number;
    Id_categoria_PK: number;
  }) => Promise<void>;
};

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

function ModalCreateProducts({ onCreate }: ModalCreateProductsProps) {
  const { categorias } = useCategorias();
  const activeCategories = useMemo(
    () => categorias.filter((categoria) => categoria.estado === "activo"),
    [categorias],
  );

  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [fechaAgregado, setFechaAgregado] = useState("");
  const [fechaCaducidad, setFechaCaducidad] = useState("");
  const [stockActual, setStockActual] = useState("");
  const [categoriaId, setCategoriaId] = useState("");

  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  const selectedCategory = useMemo(
    () => activeCategories.find((categoria) => String(categoria.id) === categoriaId) ?? null,
    [activeCategories, categoriaId],
  );

  const requiresCaducidad = useMemo(() => {
    if (!selectedCategory) return false;
    return requiresCaducidadByCategoryName(selectedCategory.nombre);
  }, [selectedCategory]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombreTrim = nombre.trim();
    const precioNumber = Number(precio);
    const stockNumber = Number(stockActual);
    const categoryNumber = Number(categoriaId);

    if (!nombreTrim) return;
    if (Number.isNaN(precioNumber) || precioNumber < 0) return;
    if (Number.isNaN(stockNumber) || stockNumber < 0 || !Number.isInteger(stockNumber)) return;
    if (!fechaAgregado) return;
    if (requiresCaducidad && !fechaCaducidad) return;
    if (Number.isNaN(categoryNumber) || categoryNumber <= 0) return;

    const fechaCaducidadFinal = requiresCaducidad ? fechaCaducidad : fechaAgregado;

    setSaving(true);
    try {
      await onCreate({
        nombre_p: nombreTrim,
        precio_p: precioNumber,
        fecha_agregado_p: fechaAgregado,
        fecha_caducidad_p: fechaCaducidadFinal,
        stock_actual: stockNumber,
        Id_categoria_PK: categoryNumber,
      });

      await showSuccessAlert("Producto creado exitosamente");
      handleClose();
      setNombre("");
      setPrecio("");
      setFechaAgregado("");
      setFechaCaducidad("");
      setStockActual("");
      setCategoriaId("");
    } catch (error) {
      await showErrorAlert(error, "Error al crear el producto");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button onClick={handleShow} className="btn_create-category">
        Crear producto
      </button>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Crear producto</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="form_create-category">
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Nombre"
              required
            />
            <input
              value={precio}
              onChange={(event) => setPrecio(event.target.value)}
              type="number"
              min="0"
              step="0.01"
              placeholder="Precio"
              required
            />
            <select
              value={categoriaId}
              onChange={(event) => {
                const nextCategoryId = event.target.value;
                setCategoriaId(nextCategoryId);

                const nextCategory = activeCategories.find(
                  (categoria) => String(categoria.id) === nextCategoryId,
                );

                if (!nextCategory || !requiresCaducidadByCategoryName(nextCategory.nombre)) {
                  setFechaCaducidad("");
                }
              }}
              required
            >
              <option value="">Selecciona una categoria</option>
              {activeCategories.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
            <input
              value={fechaAgregado}
              onChange={(event) => setFechaAgregado(event.target.value)}
              type="date"
              placeholder="Fecha agregado"
              className="input_ag"
              required
            />
            <p className="focus_input_ag">Fecha Agregado</p>

            {requiresCaducidad ? (
              <>
                <input
                  value={fechaCaducidad}
                  onChange={(event) => setFechaCaducidad(event.target.value)}
                  type="date"
                  placeholder="Fecha caducidad"
                  required
                  className="input_ca"
                />
                <p className="focus_input_ca">Fecha Caducidad</p>
              </>
            ) : null}

            <input
              value={stockActual}
              onChange={(event) => setStockActual(event.target.value)}
              type="number"
              min="0"
              step="1"
              placeholder="Stock"
              required
            />

            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} variant="primary">
              {saving ? "Guardando..." : "Crear producto"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalCreateProducts;
