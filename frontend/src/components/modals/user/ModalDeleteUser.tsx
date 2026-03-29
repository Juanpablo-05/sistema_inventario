import { useState } from "react";
import Button from "react-bootstrap/Button";
import { IoTrash } from "react-icons/io5";
import {
  showErrorAlert,
  showSuccessAlert,
  confirmDangerAction,
} from "../../../utils/alerts";
import type { DeleteUserResult } from "../../home/types/HomeUserTypes";

type ModalDeleteUserProps = {
  id: number;
  nombre?: string | null;
  username: string;
  onDelete: (id: number) => Promise<DeleteUserResult>;
};

function ModalDeleteUser({
  id,
  nombre,
  username,
  onDelete,
}: ModalDeleteUserProps) {
  const [deleting, setDeleting] = useState(false);
  const displayName = nombre?.trim() || username;

  async function handleDeleteConfirm() {
    if (deleting) return;

    const confirmed = await confirmDangerAction({
      title: "Eliminar usuario",
      text: `Se eliminará al usuario "${displayName}". Esta acción no se podrá deshacer.`,
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      const result = await onDelete(id);
      await showSuccessAlert(
        result.action === "deactivated" ? "Usuario desactivado" : "Usuario eliminado",
        result.message,
      );
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
