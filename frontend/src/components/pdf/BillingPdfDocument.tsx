import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

export type BillingPdfLine = {
  id: string | number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  impuestoLinea: number;
  totalLinea: number;
};

export type BillingPdfData = {
  numeroFactura: string;
  fechaEmision: string;
  clienteNombre: string;
  clienteDocumento: string;
  vendedor: string;
  observaciones: string;
  subtotal: number;
  impuesto: number;
  total: number;
  lines: BillingPdfLine[];
};

const styles = StyleSheet.create({
  page: {
    padding: 28,
    fontSize: 11,
    color: "#1f2937",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  companyName: {
    fontSize: 14,
    fontWeight: 700,
  },
  muted: {
    color: "#4b5563",
    marginTop: 2,
  },
  invoiceTag: {
    borderWidth: 1,
    borderColor: "#94a3b8",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    minWidth: 140,
    textAlign: "center",
  },
  section: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  label: {
    color: "#374151",
  },
  value: {
    fontWeight: 600,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  colProducto: { width: "38%" },
  colCantidad: { width: "12%", textAlign: "center" },
  colPrecio: { width: "16%", textAlign: "right" },
  colDesc: { width: "14%", textAlign: "right" },
  colImp: { width: "10%", textAlign: "right" },
  colTotal: { width: "10%", textAlign: "right" },
  totals: {
    marginTop: 12,
    marginLeft: "auto",
    width: 220,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 6,
    padding: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#94a3b8",
    marginTop: 6,
    paddingTop: 6,
    fontWeight: 700,
  },
  footer: {
    marginTop: 18,
    fontSize: 9,
    color: "#64748b",
  },
});

function asCop(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

export function BillingPdfDocument({ data }: { data: BillingPdfData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>Tu Empresa S.A.S.</Text>
            <Text style={styles.muted}>NIT 900.123.456-7</Text>
            <Text style={styles.muted}>Bogotá, Colombia</Text>
          </View>
          <View style={styles.invoiceTag}>
            <Text>FACTURA</Text>
            <Text>{data.numeroFactura}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Fecha emisión:</Text>
            <Text style={styles.value}>{data.fechaEmision || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{data.clienteNombre || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Documento:</Text>
            <Text style={styles.value}>{data.clienteDocumento || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vendedor:</Text>
            <Text style={styles.value}>{data.vendedor || "-"}</Text>
          </View>
        </View>

        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colProducto}>Producto</Text>
            <Text style={styles.colCantidad}>Cant.</Text>
            <Text style={styles.colPrecio}>P. Unit.</Text>
            <Text style={styles.colDesc}>Desc.</Text>
            <Text style={styles.colImp}>Imp.</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {data.lines.map((line) => (
            <View key={String(line.id)} style={styles.tableRow}>
              <Text style={styles.colProducto}>{line.producto}</Text>
              <Text style={styles.colCantidad}>{line.cantidad}</Text>
              <Text style={styles.colPrecio}>{asCop(line.precioUnitario)}</Text>
              <Text style={styles.colDesc}>{asCop(line.descuento)}</Text>
              <Text style={styles.colImp}>{asCop(line.impuestoLinea)}</Text>
              <Text style={styles.colTotal}>{asCop(line.totalLinea)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{asCop(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text>Impuesto</Text>
            <Text>{asCop(data.impuesto)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text>Total</Text>
            <Text>{asCop(data.total)}</Text>
          </View>
        </View>

        <Text style={styles.footer}>
          Observaciones: {data.observaciones || "N/A"}
        </Text>
      </Page>
    </Document>
  );
}

