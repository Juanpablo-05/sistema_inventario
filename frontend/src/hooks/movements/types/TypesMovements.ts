type MovementApiItem = {
  id: number;
  Id_Produ_PK: number;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  fecha_movimiento: string;
  motivo: string;
  stock_anterior: number;
  stock_nuevo: number;
  usuario_id: number;
  origen_tipo: 'admin' | 'venta' | 'anulacion';
  origen_id: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type MovementsResponse = {
  inventory_movements: MovementApiItem[];
};

type CreateMovementInput = {
  Id_producto_PK: number;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: number;
  fecha_movimiento: string;
  motivo: string;
  usuario_id: number;
  origen_tipo: "admin" | "venta" | "anulacion";
  origen_id: number;
};

type UpdateMovementInput = {
  Id_producto_PK?: number;
  tipo?: "entrada" | "salida" | "ajuste";
  cantidad?: number;
  fecha_movimiento?: string;
  motivo?: string;
  usuario_id?: number;
  origen_tipo?: "admin" | "venta" | "anulacion";
  origen_id?: number;
};

export type { MovementApiItem, MovementsResponse, CreateMovementInput, UpdateMovementInput };