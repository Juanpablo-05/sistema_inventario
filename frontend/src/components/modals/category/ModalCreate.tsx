import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import { useState } from "react";

import '../../../css/modals/modals.css'

type ModalCreateProps = {
    onCreate: (input: {
        nombre: string;
        descripcion?: string;
        estado?: "activo" | "inactivo";
    }) => Promise<void>;
};

function ModalCreate({ onCreate }: ModalCreateProps) {
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
            await onCreate({
            nombre: nombreTrim,
            descripcion: descripcionTrim ? descripcionTrim : undefined,
            estado,
            });
            setNombre("");
            setDescripcion("");
            handleClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <button onClick={handleShow} className="btn_create-category">
            Crear categoría
            </button>

            <Modal
            show={show}
            onHide={handleClose}
            backdrop="static"
            keyboard={false}
            >
            <Modal.Header closeButton>
                <Modal.Title>Modal heading</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form
                onSubmit={handleSubmit}
                className="form_create-category"
                >
                    <input
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Nombre"
                        required
                    />
                    <input
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        placeholder="Descripción"
                        required
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
                        
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={saving} variant="primary">
                        {saving ? "Guardando..." : "Crear categoría"}
                    </Button>
                </form>
            </Modal.Body>
            </Modal>
        </>
    );
}

export default ModalCreate
