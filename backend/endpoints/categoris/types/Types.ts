type CamposCategoriCreate = {
    nombre: string;
    descripcion?: string;   
    estado: 'activo' | 'inactivo';
}
type CamposCategoriEdite = {
    nombre: string;
    descripcion?: string;   
    estado: 'activo' | 'inactivo';
}


export { CamposCategoriCreate, CamposCategoriEdite };
