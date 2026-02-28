import { useState } from "react";
import Button from "react-bootstrap/Button";
import { IoTrash } from "react-icons/io5";
import {
    confirmDangerAction,
    showErrorAlert,
    showSuccessAlert,
} from "../../../utils/alerts";

type ModalDeleteProductsProps = {
    id: number;
    nombre: string;
    onDelete: (id: number) => Promise<void>;
};

function ModalDeleteProducts({ id, nombre, onDelete }: ModalDeleteProductsProps) {
    const [deleting, setDeleting] = useState(false);

    async function handleDeleteConfirm() {
        if (deleting) return;

        const confirmed = await confirmDangerAction({
            title: "Eliminar producto",
            text: `Se eliminará "${nombre}". Esta acción no se puede deshacer.`,
        });

        if (!confirmed) return;

        setDeleting(true);
        try {
            await onDelete(id);
            await showSuccessAlert("Producto eliminado");
        } catch (error) {
            await showErrorAlert(error, "No se pudo eliminar");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
            <IoTrash color="white" size={20} />
        </Button>
    );
}

export default ModalDeleteProducts;
