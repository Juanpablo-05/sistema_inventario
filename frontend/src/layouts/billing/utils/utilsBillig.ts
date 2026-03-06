export type BillingLineDraft = {
  id: string;
  productoId: string;
  cantidad: string;
  precioUnitario: string;
  descuento: string;
  impuestoLinea: string;
};

const currency = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

function createEmptyLine(seed = Date.now()): BillingLineDraft {
  return {
    id: `line-${seed}-${Math.random().toString(36).slice(2, 7)}`,
    productoId: "",
    cantidad: "1",
    precioUnitario: "0",
    descuento: "0",
    impuestoLinea: "0",
  };
}

function formatDateForPdf(value: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("es-CO");
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 900) + 100);
  return `FAC-${y}${m}${d}-${random}`;
}

function lineTotal(
  qty: number,
  price: number,
  discount: number,
  tax: number,
): number {
  return qty * price - discount + tax;
}

export {
  currency,
  createEmptyLine,
  formatDateForPdf,
  generateInvoiceNumber,
  lineTotal,
};
