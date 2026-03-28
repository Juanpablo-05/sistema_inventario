import { useState } from "react";
import Button from "react-bootstrap/Button";
import { IoTrash } from "react-icons/io5";
import {
  showErrorAlert,
  showSuccessAlert,
  confirmDangerAction,
} from "../../../utils/alerts";

type ModalDeleteUserProps = {
  id: number;
  nombre?: string | null;
  username: string;
  onDelete: (id: number) => Promise<void>;
};

function ModalDeleteUser({
  id,
  nombre,
  onDelete,
}: ModalDeleteUserProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (deleting) return;

    const confirmed = await confirmDangerAction({
      title: "Eliminar usuario",
      text: `Se eliminará al usuario "${nombre}". Esta acción no se puedodra deshacer.`,
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete(id);
      await showSuccessAlert("Usuario eliminado");
    } catch (error) {
      await showErrorAlert(error, "No se pudo eliminar");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Button type="button" variant="danger" onClick={handleDeleteConfirm}>
        <IoTrash color="white" size={18} />
      </Button>
    </>
  );
}

export default ModalDeleteUser;
