import { useApi } from "../../context/ApiContext";
import { useCallback, useEffect, useState } from "react";
import type { CreateUserInput, UpdateUserInput, UserApiItem, UsersResponse } from "../users/types/UserTypes";

type DeleteUserResponse = {
    message: string;
    action: "deleted" | "deactivated";
};

export function useUsers() { 
    const { request, user } = useApi();
    const [currentUser, setCurrentUser] = useState<
        Omit<UserApiItem, "created_at" | "updated_at"> | null
    >(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentUsers, setCurrentUsers] = useState<UsersResponse>([]);

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
                estado: userRow.estado,
                rol: userRow.rol,
                permiso_factura: userRow.permiso_factura,
                numero_movimientos: userRow.numero_movimientos,
                numero_facturas: userRow.numero_facturas,
            });
        } catch (error) {
            setError("Error fetching users");
        } finally {
            setLoading(false);
        }
    }, [user?.id, request]);

    const fetchAllUsers = useCallback(async ()=>{
        setLoading(true);
        setError(null);
        
        try {
            const data = await request<UsersResponse>(`/users/`);

            const list = Array.isArray(data) ? data : [];


            setCurrentUsers(list.map(userRow => ({
                id: userRow.id,
                nombre: userRow.nombre ?? null,
                tipo_documento: userRow.tipo_documento ?? null,
                numero_documento: userRow.numero_documento ?? null,
                username: userRow.username,
                email: userRow.email ?? null,
                estado: userRow.estado,
                rol: userRow.rol,
                permiso_factura: userRow.permiso_factura,
                numero_movimientos: userRow.numero_movimientos ?? null,
                numero_facturas: userRow.numero_facturas ?? null,
                created_at: userRow.created_at ?? null,
                updated_at: userRow.updated_at ?? null,
            })));
         }catch (error) {
            setError("Error fetching users");
        } finally {
            setLoading(false);
        }
    }, [request])

    const createUser = useCallback(
        async (input: CreateUserInput) => {
            setError(null);
            await request("/users/create", {
                method: "POST",
                body: JSON.stringify(input),
            });
            await fetchAllUsers();
        },
        [fetchAllUsers, request],
    );

    const updateUser = useCallback(
        async (id: number, input: UpdateUserInput) => {
            setError(null);
            await request(`/users/edit/${id}`, {
                method: "PUT",
                body: JSON.stringify(input),
            });
            await fetchAllUsers();
            if (user?.id === id) {
                await fetchUser();
            }
        },
        [fetchAllUsers, fetchUser, request, user?.id],
    );

    const deleteUser = useCallback(
        async (id: number) => {
            setError(null);
            const response = await request<DeleteUserResponse>(`/users/delete/${id}`, {
                method: "DELETE",
            });
            await fetchAllUsers();
            if (user?.id === id) {
                await fetchUser();
            }
            return response;
        },
        [fetchAllUsers, fetchUser, request, user?.id],
    );

    useEffect(() => {
        void fetchUser();
    }, [fetchUser]);

    return {
        currentUser,
        currentUsers,
        loading,
        error,
        fetchUser,
        fetchAllUsers,
        createUser,
        updateUser,
        deleteUser,
    };
}
