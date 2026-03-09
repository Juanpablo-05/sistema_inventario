import { useEffect, useMemo, useState } from "react";
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
import { useUsers } from "../hooks/users/useUsers";
import "../css/home/home_page.css";

type UserItem = {
    id: number;
    nombre?: string | null;
    username: string;
    email: string | null;
    rol: "admin" | "empleado";
    numero_movimientos?: number | null;
    numero_facturas?: number | null;
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
    const { user } = useApi();
    const [error, setError] = useState<string | null>(null);

    const {currentUsers, fetchAllUsers, loading} = useUsers();

    useEffect(() => {
        void fetchAllUsers();
    }, [fetchAllUsers]);

    const stats = useMemo(() => {
        const total = currentUsers.length;
        const admins = currentUsers.filter((u) => u.rol === "admin").length;
        const empleados = currentUsers.filter((u) => u.rol === "empleado").length;
        const facturas = currentUsers.reduce((acc, current) => acc + Number(current.numero_facturas ?? 0), 0);
        const movimientos = currentUsers.reduce((acc, current) => acc + Number(current.numero_movimientos ?? 0), 0);
        return { total, admins, empleados, facturas, movimientos };
    }, [currentUsers]);

    const recentUsers = useMemo(
        () => [...currentUsers].sort((a, b) => getUserSortDate(b) - getUserSortDate(a)).slice(0, 6),
        [currentUsers],
    );

    console.log(setError)

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
                onClick={() => void fetchAllUsers()}
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
                    <h3>Facturas emitidas</h3>
                    <p>{stats.facturas}</p>
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
                    <th>Facturas</th>
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
                            <td>{item.numero_facturas ?? 0}</td>
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
