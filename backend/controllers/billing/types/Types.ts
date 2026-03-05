type CamposBillingCreate = {
    numero_factura: string;
    usuario_id: number;
    cliente_nombre: string;
    cliente_documento: string;
    observaciones?: string;
    subtotal: number;
    impuestos: number;
    total: number;
    estado: 'emitida' | 'anulada';
}

type CamposBillingEdite = {
    numero_factura?: string;
    usuario_id?: number;
    cliente_nombre?: string;
    cliente_documento?: string;
    observaciones?: string;
    subtotal?: number;
    impuestos?: number;
    total?: number;
    estado?: 'emitida' | 'anulada';
    fecha_emision?: Date;
}

export type { CamposBillingCreate, CamposBillingEdite };