import { useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { IoTrash } from "react-icons/io5";

type ModalDeleteProps = {
    id: number;
    onDelete: (id: number) => Promise<void>;
};

function ModalDelete({ id, onDelete }: ModalDeleteProps) {

    const [show, setShow] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    async function handleDelete() {
        setDeleting(true);
        try {
            await onDelete(id);
            handleClose();
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <Button variant="danger" onClick={handleShow}>
                <IoTrash color="white" size={20}/>
            </Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar categoría</Modal.Title>   
                </Modal.Header>
                <Modal.Body>¿Estás seguro de que deseas eliminar esta categoría?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

export default ModalDelete
