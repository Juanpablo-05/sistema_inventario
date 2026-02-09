type inventoriMovTypeCreate = {
    id: number;
    Id_producto_PK: number;
    tipo: string;
    cantidad: number;
    fecha_movimiento: string;
    motivo: string;
    stock_anterior: number;
    stock_nuevo: number;
}

type inventoriMovTypeUpdate = {
    Id_producto_PK?: number;
    tipo?: string;
    cantidad?: number;
    fecha_movimiento?: string;
    motivo?: string;
    stock_anterior?: number;
    stock_nuevo?: number;
}

export { inventoriMovTypeCreate, inventoriMovTypeUpdate };
