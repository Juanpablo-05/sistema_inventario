import { useMemo, useState } from "react";
import {
  IoAddCircleOutline,
  IoCloudDownloadOutline,
  IoDocumentTextOutline,
  IoRefreshOutline,
  IoSaveOutline,
  IoTrashOutline,
} from "react-icons/io5";
import { PDFDownloadLink } from "@react-pdf/renderer";

import { useProductos } from "../../hooks/products/useProducts";
import { useBilling, type Billing, type BillingDetail } from "../../hooks/billing/useBilling";
import { useApi } from "../../context/ApiContext";
import { showErrorAlert, showSuccessAlert } from "../../utils/alerts";
import { BillingPdfDocument, type BillingPdfData } from "../../components/pdf/BillingPdfDocument";
import { toDateInputValue } from "../../utils/normalize";
import { currency, createEmptyLine, formatDateForPdf, generateInvoiceNumber, lineTotal } from "./utils/utilsBillig";
import type { BillingLineDraft } from "./utils/utilsBillig";

import "../../css/billing/billing_layout.css";

function BillingLayout() {
  const { user } = useApi();
  const { productos, loading: productsLoading } = useProductos();
  const { billings, loading, error, reload, issueBilling, getBillingDetails } = useBilling();

  const [numeroFactura, setNumeroFactura] = useState(generateInvoiceNumber());
  const [fechaEmision, setFechaEmision] = useState(() => toDateInputValue(new Date().toISOString()));
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteDocumento, setClienteDocumento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [lineas, setLineas] = useState<BillingLineDraft[]>([createEmptyLine()]);
  const [issuing, setIssuing] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState<Billing | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<BillingDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const calculatedLines = useMemo(
    () =>
      lineas.map((line) => {
        const productoIdNum = Number(line.productoId);
        const cantidadNum = Number(line.cantidad);
        const precioNum = Number(line.precioUnitario);
        const descuentoNum = Number(line.descuento || 0);
        const impuestoNum = Number(line.impuestoLinea || 0);
        const product = productos.find((p) => p.id_p === productoIdNum);
        const totalLinea = lineTotal(cantidadNum || 0, precioNum || 0, descuentoNum || 0, impuestoNum || 0);

        return {
          ...line,
          productoIdNum,
          cantidadNum,
          precioNum,
          descuentoNum,
          impuestoNum,
          totalLinea,
          productName: product?.nombre_p ?? "",
          stockActual: Number(product?.stock_actual ?? 0),
        };
      }),
    [lineas, productos],
  );

  const subtotal = useMemo(
    () =>
      calculatedLines.reduce((acc, line) => {
        const base = line.cantidadNum * line.precioNum - line.descuentoNum;
        return acc + (Number.isFinite(base) ? base : 0);
      }, 0),
    [calculatedLines],
  );

  const impuesto = useMemo(
    () =>
      calculatedLines.reduce(
        (acc, line) => acc + (Number.isFinite(line.impuestoNum) ? line.impuestoNum : 0),
        0,
      ),
    [calculatedLines],
  );

  const total = subtotal + impuesto;

  const touchedLines = useMemo(
    () =>
      calculatedLines.filter(
        (line) =>
          line.productoIdNum > 0 ||
          line.cantidad !== "1" ||
          line.precioUnitario !== "0" ||
          line.descuento !== "0" ||
          line.impuestoLinea !== "0",
      ),
    [calculatedLines],
  );

  const validTouchedLines = useMemo(
    () =>
      touchedLines.filter(
        (line) =>
          line.productoIdNum > 0 &&
          line.cantidadNum > 0 &&
          line.precioNum >= 0 &&
          line.cantidadNum <= line.stockActual,
      ),
    [touchedLines],
  );

  const hasInvalidTouchedLines = touchedLines.length !== validTouchedLines.length;
  const canIssue = touchedLines.length > 0 && !hasInvalidTouchedLines;

  const pdfData: BillingPdfData = useMemo(() => {
    if (selectedBilling) {
      return {
        numeroFactura: selectedBilling.numero_factura,
        fechaEmision: formatDateForPdf(selectedBilling.fecha_emision),
        clienteNombre: selectedBilling.cliente_nombre ?? "-",
        clienteDocumento: selectedBilling.cliente_documento ?? "-",
        vendedor: user?.username ?? "-",
        observaciones: selectedBilling.observaciones ?? "",
        subtotal: selectedBilling.subtotal,
        impuesto: selectedBilling.impuesto,
        total: selectedBilling.total,
        lines: selectedDetails.map((detail) => ({
          id: detail.id,
          producto: detail.producto_nombre,
          cantidad: detail.cantidad,
          precioUnitario: detail.precio_unitario,
          descuento: detail.descuento,
          impuestoLinea: detail.impuesto_linea,
          totalLinea: detail.total_linea,
        })),
      };
    }

    return {
      numeroFactura: numeroFactura || "FACTURA-BORRADOR",
      fechaEmision: formatDateForPdf(fechaEmision),
      clienteNombre: clienteNombre || "-",
      clienteDocumento: clienteDocumento || "-",
      vendedor: user?.username ?? "-",
      observaciones,
      subtotal,
      impuesto,
      total,
      lines: calculatedLines
        .filter((line) => line.productoIdNum > 0 && line.cantidadNum > 0)
        .map((line) => ({
          id: line.id,
          producto: line.productName || "Producto",
          cantidad: line.cantidadNum,
          precioUnitario: line.precioNum,
          descuento: line.descuentoNum,
          impuestoLinea: line.impuestoNum,
          totalLinea: line.totalLinea,
        })),
    };
  }, [
    selectedBilling,
    selectedDetails,
    user?.username,
    numeroFactura,
    fechaEmision,
    clienteNombre,
    clienteDocumento,
    observaciones,
    subtotal,
    impuesto,
    total,
    calculatedLines,
  ]);

  function clearDraft(alsoSelection = false) {
    setNumeroFactura(generateInvoiceNumber());
    setFechaEmision(toDateInputValue(new Date().toISOString()));
    setClienteNombre("");
    setClienteDocumento("");
    setObservaciones("");
    setLineas([createEmptyLine()]);
    if (alsoSelection) {
      setSelectedBilling(null);
      setSelectedDetails([]);
    }
  }

  async function handleSelectBilling(billing: Billing) {
    setSelectedBilling(billing);
    setLoadingDetails(true);
    setSelectedDetails([]);
    try {
      const details = await getBillingDetails(billing.id);
      setSelectedDetails(details);
    } catch (err) {
      await showErrorAlert(err, "No se pudieron cargar los detalles");
    } finally {
      setLoadingDetails(false);
    }
  }

  function updateLine(id: string, field: keyof BillingLineDraft, value: string) {
    setLineas((prev) =>
      prev.map((line) => {
        if (line.id !== id) return line;

        if (field === "productoId") {
          const product = productos.find((p) => String(p.id_p) === value);
          return {
            ...line,
            productoId: value,
            precioUnitario: product ? String(product.precio_p) : "0",
          };
        }

        return { ...line, [field]: value };
      }),
    );
  }

  function addLine() {
    setLineas((prev) => [...prev, createEmptyLine()]);
  }

  function removeLine(id: string) {
    setLineas((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((line) => line.id !== id);
    });
  }

  async function handleIssueBilling() {
    if (!clienteNombre.trim() || !clienteDocumento.trim()) {
      await showErrorAlert(new Error("Completa los datos del cliente"), "Validación");
      return;
    }

    if (touchedLines.length === 0) {
      await showErrorAlert(new Error("Agrega al menos una línea válida"), "Validación");
      return;
    }
    if (hasInvalidTouchedLines) {
      await showErrorAlert(
        new Error("Revisa las líneas: producto, cantidad, precio o stock disponibles"),
        "Validación",
      );
      return;
    }

    setIssuing(true);
    try {
      const result = await issueBilling({
        numero_factura: numeroFactura.trim() || undefined,
        cliente_nombre: clienteNombre.trim(),
        cliente_documento: clienteDocumento.trim(),
        observaciones: observaciones.trim() || undefined,
        fecha_emision: fechaEmision || undefined,
        items: validTouchedLines.map((line) => ({
          producto_id: line.productoIdNum,
          cantidad: line.cantidadNum,
          precio_unitario: line.precioNum,
          descuento: line.descuentoNum,
          impuesto_linea: line.impuestoNum,
        })),
      });

      const issuedBilling: Billing = {
        id: result.factura_id,
        numero_factura: result.numero_factura,
        usuario_id: Number(user?.id ?? 0),
        cliente_nombre: clienteNombre.trim() || null,
        cliente_documento: clienteDocumento.trim() || null,
        observaciones: observaciones.trim() || null,
        subtotal: result.subtotal,
        impuesto: result.impuesto,
        total: result.total,
        estado: "emitida",
        fecha_emision: fechaEmision,
      };

      setSelectedBilling(issuedBilling);
      const details = await getBillingDetails(result.factura_id);
      setSelectedDetails(details);

      await showSuccessAlert("Factura emitida", `Se creó ${result.numero_factura}`);
      clearDraft(false);
      await reload();
    } catch (err) {
      await showErrorAlert(err, "No se pudo emitir la factura");
    } finally {
      setIssuing(false);
    }
  }

  async function handleSaveDraft() {
    await showSuccessAlert("Borrador local guardado");
  }

  return (
    <div className="container_billing-layout">
      <section className="billing_header">
        <div className="billing_title">
          <p className="billing_kicker">Módulo de Facturación</p>
          <h2>Facturas</h2>
          <span className="billing_status">Borrador</span>
        </div>

        <div className="billing_actions">
          <button
            type="button"
            className="billing_btn billing_btn-secondary"
            onClick={() => clearDraft(true)}
          >
            <IoAddCircleOutline size={18} />
            Nueva Factura
          </button>
          <button
            type="button"
            className="billing_btn billing_btn-secondary"
            onClick={handleSaveDraft}
          >
            <IoSaveOutline size={18} />
            Guardar Borrador
          </button>
          <button
            type="button"
            className="billing_btn billing_btn-secondary"
            onClick={reload}
          >
            <IoRefreshOutline size={18} />
            Recargar
          </button>
        </div>
      </section>

      <section className="billing_workspace">
        <article className="billing_panel">
          <header className="billing_panel-header">
            <h3>
              <IoDocumentTextOutline size={18} />
              Datos de Factura
            </h3>
            <p>Formulario operativo para emitir facturas</p>
          </header>

          <div className="billing_form-grid">
            <label>
              Número de factura
              <input
                
                name="numero_factura"
                type="text"
                value={numeroFactura}
                onChange={(e) => setNumeroFactura(e.target.value)}
              />
            </label>
            <label>
              Fecha de emisión
              <input
                name="fecha_emision"
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
              />
            </label>
            <label>
              Vendedor
              <input
                name="vendedor"
                type="text"
                value={user?.username ?? "-"}
                readOnly
              />
            </label>
            <label>
              Estado
              <input name="estado" type="text" value="emitida" readOnly />
            </label>
            <label>
              Cliente
              <input
                name="cliente"
                type="text"
                value={clienteNombre}
                onChange={(e) => setClienteNombre(e.target.value)}
              />
            </label>
            <label>
              Documento cliente
              <input
                name="documento_cliente"
                type="text"
                value={clienteDocumento}
                onChange={(e) => setClienteDocumento(e.target.value)}
              />
            </label>
            <label className="billing_full-width">
              Observaciones
              <input
                name="observaciones"
                type="text"
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </label>
          </div>

          <div className="billing_items">
            <div className="billing_items-header">
              <h4>Detalle de productos</h4>
              <button
                type="button"
                className="billing_btn billing_btn-secondary"
                onClick={addLine}
              >
                <IoAddCircleOutline size={16} />
                Agregar línea
              </button>
            </div>

            <div className="billing_items-table-wrap">
              <table className="billing_items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Descuento</th>
                    <th>Impuesto</th>
                    <th>Total Línea</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {calculatedLines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        <select
                          value={line.productoId}
                          onChange={(e) =>
                            updateLine(line.id, "productoId", e.target.value)
                          }
                        >
                          <option value="">Selecciona producto</option>
                          {productos.map((product) => (
                            <option key={product.id_p} value={product.id_p}>
                              {product.nombre_p}
                            </option>
                          ))}
                        </select>
                        {line.productoIdNum > 0 ? (
                          <small className="billing_hint">
                            Stock: {line.stockActual}
                          </small>
                        ) : null}
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={line.cantidad}
                          onChange={(e) =>
                            updateLine(line.id, "cantidad", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={line.precioUnitario}
                          onChange={(e) =>
                            updateLine(
                              line.id,
                              "precioUnitario",
                              e.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={line.descuento}
                          onChange={(e) =>
                            updateLine(line.id, "descuento", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          value={line.impuestoLinea}
                          onChange={(e) =>
                            updateLine(line.id, "impuestoLinea", e.target.value)
                          }
                        />
                      </td>
                      <td>
                        {currency.format(
                          Number.isFinite(line.totalLinea)
                            ? line.totalLinea
                            : 0,
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="billing_btn billing_btn-icon"
                          onClick={() => removeLine(line.id)}
                          aria-label="Eliminar línea"
                        >
                          <IoTrashOutline size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="billing_totals">
            <div className="price_line">
              <span>Subtotal</span>
              <strong>{currency.format(subtotal)}</strong>
            </div>
            <div className="price_line">
              <span>Impuesto</span>
              <strong>{currency.format(impuesto)}</strong>
            </div>
            <div className="billing_total-final-opc">
              <div className="billing_total-final">
                <span>Total</span>
                <strong>{currency.format(total)}</strong>
                <button
                  type="button"
                  className="billing_btn billing_btn-primary"
                  disabled={!canIssue || issuing || productsLoading}
                  onClick={handleIssueBilling}
                >
                  {issuing ? "Emitiendo..." : "Emitir Factura"}
                </button>
                {error ? <p className="billing_error">{error}</p> : null}
              </div>
            </div>
          </footer>
        </article>

        <aside className="billing_preview">
          <header className="billing_preview-header">
            <h3>Vista previa de factura</h3>
            <PDFDownloadLink
              document={<BillingPdfDocument data={pdfData} />}
              fileName={`${pdfData.numeroFactura || "factura"}.pdf`}
              className="billing_btn billing_btn-primary billing_btn-link"
            >
              {({ loading: pdfLoading }) => (
                <>
                  <IoCloudDownloadOutline size={18} />
                  {pdfLoading ? "Generando PDF..." : "Descargar PDF"}
                </>
              )}
            </PDFDownloadLink>
          </header>

          <div className="invoice_sheet">
            <div className="invoice_sheet-top">
              <div>
                <h4>Tu Empresa S.A.S</h4>
                <p>NIT 900.123.456-7</p>
                <p>Calle 100 # 12-30, Bogotá</p>
              </div>
              <div className="invoice_chip">
                <p>FACTURA</p>
                <strong>{pdfData.numeroFactura || "BORRADOR"}</strong>
              </div>
            </div>

            <div className="invoice_sheet-meta">
              <p>
                <span>Cliente:</span> {pdfData.clienteNombre || "-"}
              </p>
              <p>
                <span>Documento:</span> {pdfData.clienteDocumento || "-"}
              </p>
              <p>
                <span>Fecha:</span> {pdfData.fechaEmision || "-"}
              </p>
            </div>

            <div className="invoice_sheet-lines">
              {pdfData.lines.length === 0 ? (
                <div className="invoice_sheet-line invoice_sheet-line-empty">
                  <p>Sin líneas en la factura</p>
                </div>
              ) : (
                pdfData.lines.map((line) => (
                  <div key={String(line.id)} className="invoice_sheet-line">
                    <p>{line.producto}</p>
                    <span>{currency.format(line.totalLinea)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="invoice_sheet-total">
              <p>Total a pagar</p>
              <strong>{currency.format(pdfData.total)}</strong>
            </div>
          </div>

          <div className="billing_history">
            <h4>Facturas recientes</h4>
            {loading ? <p>Cargando facturas...</p> : null}
            {!loading && billings.length === 0 ? (
              <p className="billing_hint">No hay facturas registradas.</p>
            ) : (
              <div className="billing_history-list">
                {billings.slice(0, 8).map((billing) => (
                  <button
                    key={billing.id}
                    type="button"
                    className={`billing_history-item${selectedBilling?.id === billing.id ? " active" : ""}`}
                    onClick={() => handleSelectBilling(billing)}
                  >
                    <span>{billing.numero_factura}</span>
                    <strong>{currency.format(billing.total)}</strong>
                  </button>
                ))}
              </div>
            )}
            {loadingDetails ? <p>Cargando detalle...</p> : null}
          </div>
        </aside>
      </section>
    </div>
  );
}

export default BillingLayout;
