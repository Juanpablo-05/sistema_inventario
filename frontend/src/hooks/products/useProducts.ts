import { useState, useCallback, useEffect } from "react";
import { useApi } from "../../context/ApiContext";

type ProductosApiItem = {
    id_p: number;
    nombre_p: string;
    precio_p: number;
    fecha_agregado_p: string;
    fecha_caducidad_p: string | "";
    stock_actual: number;
    Id_categoria_PK?: number;
    created_at_p?: string | null;
    updated_at_p?: string | null;
    nombre: string;
}

type ProductosResponse = {
    rows: ProductosApiItem[]
}   

type CreateProductInput = {
    nombre_p: string;
    precio_p: number;
    fecha_agregado_p: string;
    fecha_caducidad_p?: string;
    stock_actual: number;
    Id_categoria_PK: number;
}

type UpdateProductInput = {
    nombre_p?: string;
    precio_p?: number;
    fecha_agregado_p?: string;
    fecha_caducidad_p?: string;
    stock_actual?: number;
    Id_categoria_PK?: number;
}

export function useProductos() {
    const { request } = useApi();
    const [productos, setProductos] = useState<
        Array<
            Omit<ProductosApiItem, "created_at_p" | "updated_at_p"> & {
            created_at_p?: string | null;
            updated_at_p?: string | null;
            }
        >
        >([]);
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    
    const fetchProductos = useCallback(async () => {
        
        setLoading(true);
        setError(null);

        try {
            const data = await request<ProductosResponse>("/products/");
            const list = Array.isArray(data.rows) ? data.rows    : []


            setProductos(
                list.map((p) => ({
                    id_p: p.id_p,
                    nombre_p: p.nombre_p,
                    precio_p: p.precio_p,
                    fecha_agregado_p: p.fecha_agregado_p,
                    fecha_caducidad_p: p.fecha_caducidad_p,
                    stock_actual: p.stock_actual,
                    Id_categoria_PK: p.Id_categoria_PK,
                    created_at_p: p.created_at_p,
                    updated_at_p: p.updated_at_p,
                    nombre: p.nombre
                
            })))
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Error al cargar los productos",
            );
        } finally {
            setLoading(false)
        }
    }, [request])

    const createProduct = useCallback(
        async (input: CreateProductInput) => {
            setError(null);
            await request("/products/create", {
                method: "POST",
                body: JSON.stringify({
                    nombre_p: input.nombre_p,
                    precio_p: input.precio_p,
                    fecha_agregado_p: input.fecha_agregado_p,
                    fecha_caducidad_p: input.fecha_caducidad_p,
                    stock_actual: input.stock_actual,
                    Id_categoria_PK: input.Id_categoria_PK,
                }),
            });
            await fetchProductos();
        },
        [request, fetchProductos],
    );

    const deleteProduct = useCallback(
        async (id: number) => {
            setError(null);
            await request(`/products/delete/${id}`, {
                method: "DELETE",
            });
            await fetchProductos();
        },
        [request, fetchProductos],
    );

    const updateProduct = useCallback(
        async (id: number, input: UpdateProductInput) => {
            setError(null);
            await request(`/products/edit/${id}`, {
                method: "PUT",
                body: JSON.stringify({
                    nombre: input.nombre_p,
                    precio: input.precio_p,
                    fecha_agregado: input.fecha_agregado_p,
                    fecha_caducidad: input.fecha_caducidad_p,
                    stock_actual: input.stock_actual,
                    Id_categoria_PK: input.Id_categoria_PK,
                }),
            });
            await fetchProductos();
        },
        [request, fetchProductos],
    );

    useEffect(() => {
        void fetchProductos()
    }, [fetchProductos])

    return {
        productos,
        loading,
        error,
        reload: fetchProductos,
        createProduct,
        deleteProduct,
        updateProduct,
    }
}
