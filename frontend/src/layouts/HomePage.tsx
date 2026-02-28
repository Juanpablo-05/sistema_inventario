import { useCallback, useEffect, useMemo, useState } from "react";
import {
    IoPeople,
    IoShieldCheckmark,
    IoPerson,
    IoRefresh,
    IoReload,
    IoConstruct
} from "react-icons/io5";
import { useApi } from "../context/ApiContext";
import { formatDate } from "../utils/normalize";
import "../css/home/home_page.css";

type UserItem = {
    id: number;
    nombre?: string | null;
    username: string;
    email: string | null;
    rol: "admin" | "empleado";
    numero_movimientos?: number | null;
    created_at?: string | null;
    updated_at?: string | null;
};

function getUserSortDate(user: UserItem): number {
    const base = user.updated_at ?? user.created_at;
    if (!base) return 0;
    const parsed = new Date(base).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
}

function HomePage() {
    const { request, user } = useApi();
    const [users, setUsers] = useState<UserItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await request<UserItem[]>("/users/");
            setUsers(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error desconocido");
        } finally {
            setLoading(false);
        }
    }, [request]);

    useEffect(() => {
        void fetchUsers();
    }, [fetchUsers]);

    const stats = useMemo(() => {
        const total = users.length;
        const admins = users.filter((u) => u.rol === "admin").length;
        const empleados = users.filter((u) => u.rol === "empleado").length;
        const movimientos = users.reduce((acc, current) => acc + Number(current.numero_movimientos ?? 0), 0);
        return { total, admins, empleados, movimientos };
    }, [users]);

    const recentUsers = useMemo(
        () => [...users].sort((a, b) => getUserSortDate(b) - getUserSortDate(a)).slice(0, 6),
        [users],
    );

    console.log(recentUsers)

    return (
        <section className="home-page">
            <header className="home-header">
            <div>
                <h1>Panel de inicio</h1>
                <p>{`Hola ${user?.username ?? "usuario"}, este es el resumen actual del sistema.`}</p>
            </div>
            <button
                type="button"
                className="home-reload-btn"
                onClick={() => void fetchUsers()}
                disabled={loading}
            >
                <IoReload size={20} className={loading ? "icon-spin" : ""} />
            </button>
            </header>

            <section className="home-stats-grid">
            <article className="home-stat-card">
                <IoPeople size={22} />
                <div>
                <h3>Usuarios</h3>
                <p>{stats.total}</p>
                </div>
            </article>

            <article className="home-stat-card">
                <IoShieldCheckmark size={22} />
                <div>
                <h3>Administradores</h3>
                <p>{stats.admins}</p>
                </div>
            </article>

            <article className="home-stat-card">
                <IoPerson size={22} />
                <div>
                <h3>Empleados</h3>
                <p>{stats.empleados}</p>
                </div>
            </article>

            <article className="home-stat-card">
                <IoRefresh size={22} />
                <div>
                <h3>Movimientos registrados</h3>
                <p>{stats.movimientos}</p>
                </div>
            </article>
            </section>

            <section className="home-users-table-card">
            <h2>Usuarios recientes</h2>
            <div className="home-users-table-wrapper">
                <table className="home-users-table">
                <thead>
                    <tr>
                    <th>Nombre</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Movimientos</th>
                    <th>Actualizado</th>
                    </tr>
                </thead>
                <tbody>
                    {error ? (
                    <tr>
                        <td colSpan={6} className="home-error">
                        <IoConstruct color="red" size={20} />

                        <span>{error}</span>
                        </td>
                    </tr>
                    ) : (
                        recentUsers.map((item) => (
                        <tr key={item.id}>
                            <td>{item.nombre || "-"}</td>
                            <td>{item.username}</td>
                            <td>{item.email}</td>
                            <td>{item.rol}</td>
                            <td>{item.numero_movimientos ?? 0}</td>
                            <td>
                            {formatDate(item.updated_at ?? item.created_at)}
                            </td>
                        </tr>
                        ))
                    )}
                </tbody>
                </table>
            </div>
            </section>
        </section>
    );
}

export default HomePage;
