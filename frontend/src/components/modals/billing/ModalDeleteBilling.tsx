import { useState } from "react";
import Button from "react-bootstrap/Button";
import { IoTrash } from "react-icons/io5";
import {
  confirmDangerAction,
  showErrorAlert,
  showSuccessAlert,
} from "../../../utils/alerts";

type ModalDeleteBillingProps = {
  id: number;
  numeroFactura?: string | null;
  onDelete: (id: number) => Promise<void>;
};

function ModalDeleteBilling({ id, numeroFactura, onDelete }: ModalDeleteBillingProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteConfirm() {
    if (deleting) return;

    const confirmed = await confirmDangerAction({
      title: "Eliminar factura",
      text: numeroFactura
        ? `Se eliminará la factura ${numeroFactura}.`
        : "Esta acción no se puede deshacer.",
      confirmButtonText: "Sí, eliminar",
    });

    if (!confirmed) return;

    setDeleting(true);
    try {
      await onDelete(id);
      await showSuccessAlert("Factura eliminada", "El registro se eliminó correctamente.");
    } catch (err) {
      await showErrorAlert(err, "No se pudo eliminar la factura");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button variant="danger" onClick={handleDeleteConfirm} disabled={deleting}>
      <IoTrash color="white" size={18} />
    </Button>
  );
}

export default ModalDeleteBilling;
