import { useEffect, useMemo } from "react";
import {
  IoPeople,
  IoShieldCheckmark,
  IoPerson,
  IoRefresh,
  IoReload,
} from "react-icons/io5";
import { useApi } from "../context/ApiContext";
import { useUsers } from "../hooks/users/useUsers";
import UserAction from "../components/home/UserAction";
import "../css/home/home_page.css";

function HomePage() {
  const { user } = useApi();
  //const [error, setError] = useState<string | null>(null);

  const {
    currentUsers,
    fetchAllUsers,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  useEffect(() => {
    void fetchAllUsers();
  }, [fetchAllUsers]);

  const stats = useMemo(() => {
    const total = currentUsers.length;
    const admins = currentUsers.filter((u) => u.rol === "admin").length;
    const empleados = currentUsers.filter((u) => u.rol === "empleado").length;
    const facturas = currentUsers.reduce(
      (acc, current) => acc + Number(current.numero_facturas ?? 0),
      0,
    );
    const movimientos = currentUsers.reduce(
      (acc, current) => acc + Number(current.numero_movimientos ?? 0),
      0,
    );
    return { total, admins, empleados, facturas, movimientos };
  }, [currentUsers]);

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

      <UserAction
        users={currentUsers}
        error={error}
        onCreate={createUser}
        onEdit={updateUser}
        onDelete={deleteUser}
      />
    </section>
  );
}

export default HomePage;
