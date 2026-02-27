import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IoTrash } from "react-icons/io5";

type ModalDeleteProductsProps = {
    id: number;
    nombre: string;
    onDelete: (id: number) => Promise<void>;
};

function ModalDeleteProducts({ id, nombre, onDelete }: ModalDeleteProductsProps) {
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
                <IoTrash color="white" size={20} />
            </Button>

            <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Eliminar producto</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {`¿Estás seguro de eliminar "${nombre}"?`}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={deleting}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Eliminando..." : "Eliminar"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ModalDeleteProducts;
