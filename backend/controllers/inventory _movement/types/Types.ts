type inventoriMovTypeCreate = {
    Id_producto_PK: number;
    tipo: 'entrada' | 'salida' | 'ajuste';
    cantidad: number;
    fecha_movimiento: string;
    motivo?: string;
    usuario_id?: number;
    origen_tipo?: 'admin' | 'venta' | 'anulacion';
    origen_id?: number | null;
};

type inventoriMovTypeUpdate = {
    Id_producto_PK?: number;
    tipo?: 'entrada' | 'salida' | 'ajuste';
    cantidad?: number;
    fecha_movimiento?: string;
    motivo?: string;
    usuario_id?: number;
    origen_tipo?: 'admin' | 'venta' | 'anulacion';
    origen_id?: number | null;
};

export { inventoriMovTypeCreate, inventoriMovTypeUpdate };
