type BillingApiItem = {
  id: number;
  numero_factura: string;
  usuario_id: number;
  cliente_nombre: string | null;
  cliente_documento: string | null;
  observaciones: string | null;
  subtotal: number | string;
  impuesto: number | string;
  total: number | string;
  estado: "emitida" | "anulada";
  fecha_emision: string;
  created_at?: string | null;
  updated_at?: string | null;
};

type BillingDetailApiItem = {
  id: number;
  factura_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number | string;
  precio_unitario: number | string;
  descuento: number | string;
  impuesto_linea: number | string;
  total_linea: number | string;
};

type IssueBillingInput = {
  numero_factura?: string;
  cliente_nombre?: string;
  cliente_documento?: string;
  observaciones?: string;
  fecha_emision?: string;
  items: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    impuesto_linea?: number;
  }>;
};

type BillingIssueResponse = {
  factura_id: number;
  numero_factura: string;
  subtotal: number;
  impuesto: number;
  total: number;
  items: number;
  message: string;
};

type UpdateBillingInput = {
  numero_factura?: string;
  usuario_id?: number;
  cliente_nombre?: string;
  cliente_documento?: string;
  observaciones?: string;
  subtotal?: number;
  impuesto?: number;
  total?: number;
  estado?: "emitida" | "anulada";
  fecha_emision?: string;
};

type BillingDetailsResponse = {
  billing_details: BillingDetailApiItem[];
};

type Billing = {
  id: number;
  numero_factura: string;
  usuario_id: number;
  cliente_nombre: string | null;
  cliente_documento: string | null;
  observaciones: string | null;
  subtotal: number;
  impuesto: number;
  total: number;
  estado: "emitida" | "anulada";
  fecha_emision: string;
};

type BillingDetail = {
  id: number;
  factura_id: number;
  producto_id: number;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  descuento: number;
  impuesto_linea: number;
  total_linea: number;
};

export type {
  BillingApiItem,
  BillingDetailApiItem,
  IssueBillingInput,
  BillingIssueResponse,
  UpdateBillingInput,
  BillingDetailsResponse,
  Billing,
  BillingDetail,
};
