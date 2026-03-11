import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IoCreateOutline } from "react-icons/io5";
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";
import type { Billing } from "../../../hooks/billing/useBilling";

type BillingUpdateInput = {
  numero_factura?: string;
  cliente_nombre?: string;
  cliente_documento?: string;
  observaciones?: string;
  estado?: "emitida" | "anulada";
};

type ModalEditBillingProps = {
  billing: Billing;
  onEdit: (id: number, input: BillingUpdateInput) => Promise<void>;
};

function ModalEditBilling({ billing, onEdit }: ModalEditBillingProps) {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [numeroFactura, setNumeroFactura] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [estado, setEstado] = useState<"emitida" | "anulada">("emitida");

  useEffect(() => {
    if (!show) return;
    setNumeroFactura(billing.numero_factura ?? "");
    setClienteNombre(billing.cliente_nombre ?? "");
    setClienteDocumento(billing.cliente_documento ?? "");
    setObservaciones(billing.observaciones ?? "");
    setEstado(billing.estado ?? "emitida");
  }, [billing, show]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const formId = `edit-billing-form-${billing.id}`;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const numeroFacturaTrim = numeroFactura.trim();
    const clienteNombreTrim = clienteNombre.trim();
    const clienteDocumentoTrim = clienteDocumento.trim();
    const observacionesTrim = observaciones.trim();

    if (!numeroFacturaTrim) {
      await showErrorAlert(new Error("El número de factura es obligatorio"), "Validación");
      return;
    }

    setSaving(true);
    try {
      await onEdit(billing.id, {
        numero_factura: numeroFacturaTrim,
        cliente_nombre: clienteNombreTrim || undefined,
        cliente_documento: clienteDocumentoTrim || undefined,
        observaciones: observacionesTrim || undefined,
        estado,
      });
      handleClose();
      await showSuccessAlert("Factura actualizada", "Los cambios se guardaron correctamente.");
    } catch (error) {
      await showErrorAlert(error, "No se pudo actualizar la factura");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button variant="warning" onClick={handleShow}>
        <IoCreateOutline color="black" size={18} />
      </Button>

      <Modal show={show} onHide={handleClose} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Editar factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form id={formId} onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor={`${formId}-numero`} className="form-label">
                Número de factura
              </label>
              <input
                id={`${formId}-numero`}
                type="text"
                className="form-control"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor={`${formId}-cliente`} className="form-label">
                Cliente
              </label>
              <input
                id={`${formId}-cliente`}
                type="text"
                className="form-control"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor={`${formId}-documento`} className="form-label">
                Documento cliente
              </label>
              <input
                id={`${formId}-documento`}
                type="text"
                className="form-control"
                value={clienteDocumento}
                onChange={(e) => setClienteDocumento(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor={`${formId}-observaciones`} className="form-label">
                Observaciones
              </label>
              <input
                id={`${formId}-observaciones`}
                type="text"
                className="form-control"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor={`${formId}-estado`} className="form-label">
                Estado
              </label>
              <select
                id={`${formId}-estado`}
                className="form-select"
                value={estado}
                onChange={(e) => setEstado(e.target.value as "emitida" | "anulada")}
              >
                <option value="emitida">Emitida</option>
                <option value="anulada">Anulada</option>
              </select>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} disabled={saving} variant="warning">
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalEditBilling;
