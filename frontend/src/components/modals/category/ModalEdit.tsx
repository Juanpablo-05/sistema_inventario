import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IoCreateOutline } from "react-icons/io5";

type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: "activo" | "inactivo";
};

type ModalEditProps = {
  categoria: Categoria;
  onEdit: (id: number, input: { nombre?: string; descripcion?: string; estado?: "activo" | "inactivo" }) => Promise<void>;
};

function ModalEdit({ categoria, onEdit }: ModalEditProps) {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState(categoria.nombre);
  const [descripcion, setDescripcion] = useState(categoria.descripcion ?? "");
  const [estado, setEstado] = useState<"activo" | "inactivo">(categoria.estado);

  useEffect(() => {
    if (show) {
      setNombre(categoria.nombre);
      setDescripcion(categoria.descripcion ?? "");
      setEstado(categoria.estado);
    }
  }, [show, categoria]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nombreTrim = nombre.trim();
    if (!nombreTrim) return;
    setSaving(true);
    try {
      await onEdit(categoria.id, {
        nombre: nombreTrim,
        descripcion: descripcion.trim() || undefined,
        estado,
      });
      handleClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="warning" onClick={handleShow}>
        <IoCreateOutline color="black" size={18} />
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Editar categoría</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="form_create-category">
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre"
              required
            />
            <input
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción (opcional)"
            />
            <select value={estado} onChange={(e) => setEstado(e.target.value as "activo" | "inactivo")}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} variant="warning">
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalEdit;
