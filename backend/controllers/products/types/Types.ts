type CamposCreateProducts = {
    nombre_p: string;
    precio_p: string | number;
    fecha_agregado_p: string;
    fecha_caducidad_p: string;
    stock_actual: number;
    Id_categoria_PK: string | number;
}

type CamposUpdateProducts = {
    nombre?: string;
    precio?: string | number;
    fecha_agregado?: string;
    fecha_caducidad?: string;
    stock_actual?: number;
    Id_categoria_PK?: string | number;
}
export {CamposCreateProducts, CamposUpdateProducts} 