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
      title: "Eliminar movimiento",
      text: "Esta acción no se puede deshacer.",
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete(id);
      await showSuccessAlert("Movimiento eliminado correctamente", "El registro se eliminó correctamente.");
    } catch (err) {
      await showErrorAlert(err, "No se pudo eliminar el movimiento");
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

export default ModalDelete;
