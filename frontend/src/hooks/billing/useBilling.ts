import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../context/ApiContext";

import type{
  Billing,
  BillingApiItem,
  BillingDetail,
  BillingDetailsResponse,
  BillingIssueResponse,
  IssueBillingInput,
  UpdateBillingInput,
} from "./types/TypesBilling";

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

  const updateBilling = useCallback(
    async (id: number, payload: UpdateBillingInput): Promise<void> => {
      setError(null);
      await request(`/billing/edit/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      await fetchBillings();
    },
    [fetchBillings, request],
  );

  const deleteBilling = useCallback(
    async (id: number): Promise<void> => {
      setError(null);
      await request(`/billing/delete/${id}`, {
        method: "DELETE",
      });
      await fetchBillings();
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
    updateBilling,
    deleteBilling,
  };
}
