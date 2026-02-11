type inventoriMovTypeCreate = {
    id: number;
    Id_producto_PK: number;
    tipo: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    fecha_movimiento: string;
    motivo: string;
}

type inventoriMovTypeUpdate = {
    Id_producto_PK?: number;
    tipo?: 'entrada' | 'salida' | 'ajuste';
    cantidad?: number;
    fecha_movimiento?: string;
    motivo?: string;
}

export { inventoriMovTypeCreate, inventoriMovTypeUpdate };
