import { useEffect, useMemo, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IoEyeOutline } from "react-icons/io5";
import { showErrorAlert } from "../../../utils/alerts";
import type { Billing, BillingDetail } from "../../../hooks/billing/useBilling";
import { formatDate } from "../../../utils/normalize";

type ModalViewBillingProps = {
  billing: Billing;
  userName?: string;
  getDetails: (facturaId: number) => Promise<BillingDetail[]>;
};

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function ModalViewBilling({ billing, userName, getDetails }: ModalViewBillingProps) {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<BillingDetail[]>([]);

  useEffect(() => {
    if (!show) return;
    setLoading(true);
    setDetails([]);
    void (async () => {
      try {
        const rows = await getDetails(billing.id);
        setDetails(rows);
      } catch (error) {
        await showErrorAlert(error, "No se pudieron cargar los detalles");
      } finally {
        setLoading(false);
      }
    })();
  }, [billing.id, getDetails, show]);

  const totals = useMemo(() => {
    const subtotal = details.reduce(
      (acc, item) => acc + item.cantidad * item.precio_unitario - item.descuento,
      0,
    );
    const impuesto = details.reduce((acc, item) => acc + item.impuesto_linea, 0);
    const total = details.reduce((acc, item) => acc + item.total_linea, 0);
    return { subtotal, impuesto, total };
  }, [details]);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="info" onClick={handleShow}>
        <IoEyeOutline color="black" size={18} />
      </Button>

      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Detalle de factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <strong>Número:</strong> {billing.numero_factura}
            <br />
            <strong>Fecha:</strong> {formatDate(billing.fecha_emision)}
            <br />
            <strong>Usuario:</strong> {userName ?? billing.usuario_id}
            <br />
            <strong>Cliente:</strong> {billing.cliente_nombre ?? "-"}
            <br />
            <strong>Documento:</strong> {billing.cliente_documento ?? "-"}
          </div>

          {loading ? (
            <p>Cargando detalles...</p>
          ) : details.length === 0 ? (
            <p>No hay detalles registrados.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Impuesto</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((item) => (
                    <tr key={item.id}>
                      <td>{item.producto_nombre}</td>
                      <td>{item.cantidad}</td>
                      <td>{currency.format(item.precio_unitario)}</td>
                      <td>{currency.format(item.descuento)}</td>
                      <td>{currency.format(item.impuesto_linea)}</td>
                      <td>{currency.format(item.total_linea)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="d-flex justify-content-end gap-4 mt-3">
            <div>
              <strong>Subtotal:</strong> {currency.format(totals.subtotal)}
            </div>
            <div>
              <strong>Impuesto:</strong> {currency.format(totals.impuesto)}
            </div>
            <div>
              <strong>Total:</strong> {currency.format(totals.total || billing.total)}
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ModalViewBilling;
