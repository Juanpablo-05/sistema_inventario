type userRows = {
    nombre: string;
    username: string;
    password_hash: string;
    role: "admin" | "empleado";
}

type userRowsEdit = {
    nombre?: string;
    username?: string;
    password_hash?: string;
    role?: "admin" | "empleado";
};

type UserResponse = {
    id: number;
    username: string;
    role: "admin" | "empleado";
    numero_movimientos: number;
    created_at: string;
    updated_at: string;
}

export type {userRows, userRowsEdit, UserResponse}