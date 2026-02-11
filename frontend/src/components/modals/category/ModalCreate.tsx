import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { useState } from 'react';
import { useCategorias } from '../../../hooks/useCategorias';

function ModalCreate() {

    const { categorias, createCategoria } = useCategorias();
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [estado, setEstado] = useState<"activo" | "inactivo">("activo");
    const [saving, setSaving] = useState(false);
    
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const nombreTrim = nombre.trim();
        const descripcionTrim = descripcion.trim();
        if (!nombreTrim) return;
        setSaving(true);
        try {
            await createCategoria({
            nombre: nombreTrim,
            descripcion: descripcionTrim ? descripcionTrim : undefined,
            estado,
            });
            setNombre("");
            setDescripcion("");
        } finally {
            setSaving(false);
            console.log(categorias);
        }
    }

    return (
        <>
            <button
                onClick={handleShow}
                className="btn_create-category">
            Crear categoría
            </button>

            <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form
                onSubmit={handleSubmit}
                style={{ display: "grid", gap: 8, marginBottom: 16 }}
                >
                <input
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Nombre"
                />
                <input
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    placeholder="Descripción (opcional)"
                />
                <select
                    value={estado}
                    onChange={(e) =>
                    setEstado(e.target.value as "activo" | "inactivo")
                    }
                >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                </select>
                <button type="submit" disabled={saving}>
                    {saving ? "Guardando..." : "Crear categoría"}
                </button>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                Close
                </Button>
                <Button variant="primary" onClick={handleClose}>
                Save Changes
                </Button>
            </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalCreate