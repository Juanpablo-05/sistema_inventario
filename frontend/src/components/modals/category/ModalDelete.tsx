import { useState } from "react";
import Button from "react-bootstrap/Button";
import { IoTrash } from "react-icons/io5";
import {
    confirmDangerAction,
    showErrorAlert,
    showSuccessAlert,
} from "../../../utils/alerts";

type ModalDeleteProps = {
    id: number;
    onDelete: (id: number) => Promise<void>;
};

function ModalDelete({ id, onDelete }: ModalDeleteProps) {
    const [deleting, setDeleting] = useState(false);

    async function handleDeleteConfirm() {
        if (deleting) return;

        const confirmed = await confirmDangerAction({
            title: "Eliminar categoría",
            text: "Esta acción no se puede deshacer.",
        });

        if (!confirmed) return;

        setDeleting(true);
        try {
            await onDelete(id);
            await showSuccessAlert("Categoría eliminada", "El registro se eliminó correctamente.");
        } catch (error) {
            await showErrorAlert(error, "No se pudo eliminar");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <>
            <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
                <IoTrash color="white" size={20}/>
            </Button>
        </>
    )   
}

export default ModalDelete
