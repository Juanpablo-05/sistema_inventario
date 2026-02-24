type CamposCreateProducts = {
    nombre: string;
    precio: string | number;
    fecha_agregado: string;
    fecha_caducidad: string;
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