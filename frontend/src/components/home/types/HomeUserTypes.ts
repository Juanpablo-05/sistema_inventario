type UserItem = {
  id: number;
  nombre: string | null;
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

type UserActionProps = {
  users: UserItem[];
  error: string | null;
  onCreate: (input: CreateUserInput) => Promise<void>;
  onEdit: (id: number, input: UpdateUserInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};


export type { UserItem, CreateUserInput, UpdateUserInput, UserActionProps };