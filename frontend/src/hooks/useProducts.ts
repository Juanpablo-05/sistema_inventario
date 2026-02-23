import { useState, useCallback, useEffect } from "react";
import { useApi } from "../context/ApiContext";

type ProductosApiItem = {
    id: number;
    nombre: string;
    precio: number;
    fecha_agregado: string;
    fecha_caducidad: string;
    stock_actual: number;
    created_at?: string | null;
    updated_at?: string | null;
    Id_categoria_PK: number;
}

type ProductosResponse = {
    productos: ProductosApiItem[]
}   

export function useProductos() {
    const { request } = useApi();
    const [productos, setProductos] = useState<
        Array<
            Omit<ProductosApiItem, "created_at" | "updated_at"> & {
            created_at?: string | null;
            updated_at?: string | null;
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
            const list = Array.isArray(data.productos) ? data.productos : []

            setProductos(
                list.map((p) => ({
                    id: p.id,
                    nombre: p.nombre,
                    precio: p.precio,
                    fecha_agregado: p.fecha_agregado,
                    fecha_caducidad: p.fecha_caducidad,
                    stock_actual: p.stock_actual,
                    created_at: p.created_at ,
                    updated_at: p.updated_at ,
                    Id_categoria_PK: p.Id_categoria_PK
                
            })))
        } catch (error) {
            setError(
                error instanceof Error ? error.message : "Error al cargar los productos",
            );
        } finally {
            setLoading(false)
        }
    }, [request])

    useEffect(() => {
        void fetchProductos()
    }, [fetchProductos])

    return {
        productos,
        loading,
        error,
        reload: fetchProductos
    }
}