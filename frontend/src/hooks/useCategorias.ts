import { useCallback, useEffect, useState } from "react";
import { useApi } from "../context/ApiContext";

export type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: "activo" | "inactivo";
};

export type GetCategoriasResponse = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: "activo" | "inactivo";
  createdAt: string;
  updatedAt: string;
};

type CategoriasResponse = {
  categorias: GetCategoriasResponse[];
};

type CreateCategoriaInput = {
  nombre: string;
  descripcion?: string;
  estado?: "activo" | "inactivo";
};

export function useCategorias() {
  const { request } = useApi();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request<CategoriasResponse>("/categories/get");
      setCategorias(Array.isArray(data.categorias) ? data.categorias : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cargar categorías",
      );
    } finally {
      setLoading(false);
    }
  }, [request]);

  const createCategoria = useCallback(
    async (input: CreateCategoriaInput) => {
      setError(null);
      await request("/categories/create", {
        method: "POST",
        body: JSON.stringify({
          nombre: input.nombre,
          descripcion: input.descripcion,
          estado: input.estado ?? "activo",
        }),
      });
      await fetchCategorias();
    },
    [request, fetchCategorias],
  );

  const deleteCategoria = useCallback(
    async (id: number) => {
      setError(null);
      await request(`/categories/delete/${id}`, {
        method: "DELETE",
      });
      await fetchCategorias();
    },
    [request, fetchCategorias],
  );

  useEffect(() => {
    void fetchCategorias();
  }, [fetchCategorias]);

  return {
    categorias,
    loading,
    error,
    reload: fetchCategorias,
    createCategoria,
    deleteCategoria
  };
}
