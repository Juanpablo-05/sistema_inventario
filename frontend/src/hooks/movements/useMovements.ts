import { useCallback, useEffect, useState } from "react";
import { useApi } from "../../context/ApiContext";

import type { MovementApiItem, MovementsResponse, CreateMovementInput, UpdateMovementInput } from "./types/TypesMovements";

export function useMovements() {
  const { request } = useApi();
  const [movements, setMovements] = useState<
    Array<
      Omit<MovementApiItem, "created_at" | "updated_at"> & {
        createdAt?: string | null;
        updatedAt?: string | null;
      }
    >
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await request<MovementsResponse>("/inventory-movements/");
      const list = Array.isArray(data.inventory_movements)
        ? data.inventory_movements
        : [];

      setMovements(
        list.map((item) => ({
          id: Number(item.id),
          Id_Produ_PK: Number(item.Id_Produ_PK),
          tipo: item.tipo,
          cantidad: Number(item.cantidad),
          fecha_movimiento: item.fecha_movimiento,
          motivo: item.motivo,
          stock_anterior: Number(item.stock_anterior),
          stock_nuevo: Number(item.stock_nuevo),
          usuario_id: Number(item.usuario_id),
          origen_tipo: item.origen_tipo,
          origen_id: Number(item.origen_id),
          createdAt: item.created_at ?? null,
          updatedAt: item.updated_at ?? null,
        })),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar movimientos",
      );
    } finally {
      setLoading(false);
    }
  }, [request]);

  const createMovement = useCallback(
    async (input: CreateMovementInput) => {
      setError(null);
      await request("/inventory-movements/create", {
        method: "POST",
        body: JSON.stringify({
          Id_producto_PK: input.Id_producto_PK,
          tipo: input.tipo,
          cantidad: input.cantidad,
          fecha_movimiento: input.fecha_movimiento,
          motivo: input.motivo,
        }),
      });
      await fetchMovements();
    },
    [fetchMovements, request],
  );

  const updateMovement = useCallback(
    async (id: number, input: UpdateMovementInput) => {
      setError(null);
      await request(`/inventory-movements/edit/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          Id_producto_PK: input.Id_producto_PK,
          tipo: input.tipo,
          cantidad: input.cantidad,
          fecha_movimiento: input.fecha_movimiento,
          motivo: input.motivo,
        }),
      });
      await fetchMovements();
    },
    [fetchMovements, request],
  );

  const deleteMovement = useCallback(
    async (id: number) => {
      setError(null);
      await request(`/inventory-movements/delete/${id}`, {
        method: "DELETE",
      });
      await fetchMovements();
    },
    [fetchMovements, request],
  );

  useEffect(() => {
    void fetchMovements();
  }, [fetchMovements]);

  return {
    movements,
    loading,
    error,
    reload: fetchMovements,
    createMovement,
    updateMovement,
    deleteMovement,
  };
}
