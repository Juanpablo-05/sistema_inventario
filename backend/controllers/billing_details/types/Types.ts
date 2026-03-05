type BillingDetailCreateFields = {
    factura_id: number;
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    impuesto_linea?: number;
    total_linea?: number;
};

type BillingDetailUpdateFields = {
    factura_id?: number;
    producto_id?: number;
    cantidad?: number;
    precio_unitario?: number;
    descuento?: number;
    impuesto_linea?: number;
    total_linea?: number;
};

export type { BillingDetailCreateFields, BillingDetailUpdateFields };
