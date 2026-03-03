import { useApi } from "../context/ApiContext";
import { useCallback, useEffect, useState } from "react";

type UserApiItem = {
    id: number;
    nombre: string | null;
    tipo_documento: "CC" | "CE" | "TI" | "RC" | null;
    numero_documento: number | null;
    username: string;
    email: string | null;
    rol: "admin" | "empleado";
    numero_movimientos: number | null;
    created_at?: string | null;
    updated_at?: string | null;
};

type UsersResponse = UserApiItem[];

export function useUsers() { 
    const { request, user } = useApi();
    const [currentUser, setCurrentUser] = useState<
        Omit<UserApiItem, "created_at" | "updated_at"> | null
    >(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async () => {
        if (!user?.id) return;

        setLoading(true);
        setError(null);

        try {
            const data = await request<UsersResponse>(`/users/get/${user.id}`);
            const userRow = Array.isArray(data) ? data[0] : null;

            if (!userRow) {
                setCurrentUser(null);
                setError("No se encontro información del usuario");
                return;
            }

            setCurrentUser({
                id: userRow.id,
                nombre: userRow.nombre,
                tipo_documento: userRow.tipo_documento,
                numero_documento: userRow.numero_documento,
                username: userRow.username,
                email: userRow.email,
                rol: userRow.rol,
                numero_movimientos: userRow.numero_movimientos,
            });
        } catch (error) {
            setError("Error fetching users");
        } finally {
            setLoading(false);
        }
    }, [user?.id, request]);

    useEffect(() => {
        void fetchUser();
    }, [fetchUser]);

    return { currentUser, loading, error, fetchUser };
}
