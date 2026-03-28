type UserApiItem = {
  id: number;
  nombre: string | null;
  tipo_documento: "CC" | "CE" | "TI" | "RC" | null;
  numero_documento: number | null;
  username: string;
  email: string | null;
  estado: "activo" | "inactivo";
  rol: "admin" | "empleado";
  permiso_factura: "permitido" | "denegado";
  numero_movimientos: number | null;
  numero_facturas: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UsersResponse = UserApiItem[];

type CreateUserInput = {
  nombre: string;
  username: string;
  email: string;
  password_hash: string;
  role: "admin" | "empleado";
  estado?: "activo" | "inactivo";
  permiso_factura?: "permitido" | "denegado";
};

type UpdateUserInput = {
  nombre?: string;
  username?: string;
  email?: string;
  password_hash?: string;
  role?: "admin" | "empleado";
  estado?: "activo" | "inactivo";
  permiso_factura?: "permitido" | "denegado";
};

export type { UserApiItem, UsersResponse, CreateUserInput, UpdateUserInput };