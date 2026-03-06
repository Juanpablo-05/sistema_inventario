import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../context/ApiContext";

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

type BillingDetailsResponse = {
  billing_details: BillingDetailApiItem[];
};

export type Billing = {
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

export type BillingDetail = {
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

export function useBilling() {
  const { request } = useApi();
  const [billings, setBillings] = useState<Billing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBillings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await request<BillingApiItem[]>("/billing/");
      const list = Array.isArray(rows) ? rows : [];
      setBillings(
        list
          .map((row) => ({
            id: Number(row.id),
            numero_factura: row.numero_factura,
            usuario_id: Number(row.usuario_id),
            cliente_nombre: row.cliente_nombre ?? null,
            cliente_documento: row.cliente_documento ?? null,
            observaciones: row.observaciones ?? null,
            subtotal: Number(row.subtotal ?? 0),
            impuesto: Number(row.impuesto ?? 0),
            total: Number(row.total ?? 0),
            estado: row.estado,
            fecha_emision: row.fecha_emision,
          }))
          .sort((a, b) => b.id - a.id),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar facturas");
    } finally {
      setLoading(false);
    }
  }, [request]);

  const getBillingDetails = useCallback(
    async (facturaId: number): Promise<BillingDetail[]> => {
      const data = await request<BillingDetailsResponse>(`/billing/details/${facturaId}`);
      const list = Array.isArray(data.billing_details) ? data.billing_details : [];
      return list.map((row) => ({
        id: Number(row.id),
        factura_id: Number(row.factura_id),
        producto_id: Number(row.producto_id),
        producto_nombre: row.producto_nombre,
        cantidad: Number(row.cantidad),
        precio_unitario: Number(row.precio_unitario),
        descuento: Number(row.descuento ?? 0),
        impuesto_linea: Number(row.impuesto_linea ?? 0),
        total_linea: Number(row.total_linea ?? 0),
      }));
    },
    [request],
  );

  const issueBilling = useCallback(
    async (payload: IssueBillingInput): Promise<BillingIssueResponse> => {
      setError(null);
      const response = await request<BillingIssueResponse>("/billing/issue", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      await fetchBillings();
      return response;
    },
    [fetchBillings, request],
  );

  useEffect(() => {
    void fetchBillings();
  }, [fetchBillings]);

  return {
    billings,
    loading,
    error,
    reload: fetchBillings,
    issueBilling,
    getBillingDetails,
  };
}
