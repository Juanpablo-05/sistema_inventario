type CamposBillingCreate = {
    numero_factura: string;
    usuario_id: number;
    cliente_nombre?: string;
    cliente_documento?: string;
    observaciones?: string;
    subtotal: number;
    impuesto: number;
    total: number;
    estado: 'emitida' | 'anulada';
    fecha_emision?: string;
}

type CamposBillingEdite = {
    numero_factura?: string;
    usuario_id?: number;
    cliente_nombre?: string;
    cliente_documento?: string;
    observaciones?: string;
    subtotal?: number;
    impuesto?: number;
    total?: number;
    estado?: 'emitida' | 'anulada';
    fecha_emision?: string;
}

export type { CamposBillingCreate, CamposBillingEdite };
