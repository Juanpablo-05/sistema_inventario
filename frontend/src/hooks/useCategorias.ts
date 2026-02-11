import { useCallback, useEffect, useState } from "react";
import { useApi } from "../context/ApiContext";

export type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: "activo" | "inactivo";
};

type CategoriasApiItem = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  estado: "activo" | "inactivo";
  created_at?: string | null;
  updated_at?: string | null;
};

type CategoriasResponse = {
  categorias: CategoriasApiItem[];
};

type CreateCategoriaInput = {
  nombre: string;
  descripcion?: string;
  estado?: "activo" | "inactivo";
};

type UpdateCategoriaInput = {
  nombre?: string;
  descripcion?: string;
  estado?: "activo" | "inactivo";
};

export function useCategorias() {
  const { request } = useApi();
  const [categorias, setCategorias] = useState<
    Array<
      Omit<CategoriasApiItem, "created_at" | "updated_at"> & {
        createdAt?: string | null;
        updatedAt?: string | null;
      }
    >
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategorias = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await request<CategoriasResponse>("/categories/get");
      const list = Array.isArray(data.categorias) ? data.categorias : [];
      setCategorias(
        list.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          descripcion: c.descripcion ?? null,
          estado: c.estado,
          createdAt: c.created_at ?? null,
          updatedAt: c.updated_at ?? null,
        })),
      );
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

  const updateCategoria = useCallback(
    async (id: number, input: UpdateCategoriaInput) => {
      setError(null);
      await request(`/categories/edit/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          nombre: input.nombre,
          descripcion: input.descripcion,
          estado: input.estado,
        }),
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
    deleteCategoria,
    updateCategoria,
  };
}
