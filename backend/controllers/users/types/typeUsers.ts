type userRows = {
    nombre: string;
    username: string;
    email: string;
    password_hash: string;
    role: "admin" | "empleado";
    estado?: "activo" | "inactivo";
    permiso_factura?: "permitido" | "denegado";
}

type userRowsEdit = {
    nombre?: string;
    username?: string;
    email?: string;
    password_hash?: string;
    role?: "admin" | "empleado";
    estado?: "activo" | "inactivo";
    permiso_factura?: "permitido" | "denegado";
};

type UserResponse = {
    id: number;
    username: string;
    email: string;
    role: "admin" | "empleado";
    estado: "activo" | "inactivo";
    permiso_factura: "permitido" | "denegado";
    numero_movimientos: number;
    numero_facturas: number;
    created_at: string;
    updated_at: string;
}

export type {userRows, userRowsEdit, UserResponse}
