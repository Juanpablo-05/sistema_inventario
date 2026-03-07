import { useCategorias } from "../../hooks/category/useCategorias";
import { useProductos } from "../../hooks/products/useProducts";
import { useUsers } from "../../hooks/users/useUsers";
import {
  IoPeople,
  IoShieldCheckmark,
  IoPerson,
  IoRefresh,
  IoReload,
} from "react-icons/io5";
import "../../css/home/home_page_user.css";

function HomeUser() {
  const { categorias } = useCategorias();
  const { productos } = useProductos();
  const { currentUser, fetchUser, loading, error } = useUsers();

  return (
    <section className="home-page">
      <header className="home-header">
        <div>
          <h1>Panel de inicio</h1>
          <p className="home-welcome">
            {`Bienvenido ${currentUser?.nombre ?? currentUser?.username ?? ""}`}
          </p>
        </div>
        <button
          type="button"
          className="home-reload-btn"
          onClick={fetchUser}
          disabled={loading}
        >
          {loading ? (
            <IoRefresh className="icon-spin" size={20} />
          ) : (
            <IoReload size={20} />
          )}
        </button>
      </header>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <section className="home-stats-grid">
        <article className="home-stat-card">
          <IoPeople size={22} />
          <div>
            <h3>Usuario</h3>
            <p>{currentUser?.username ?? "-"}</p>
          </div>
        </article>

        <article className="home-stat-card">
          <IoShieldCheckmark size={22} />
          <div>
            <h3>Categorias</h3>
            <p>{categorias.length}</p>
          </div>
        </article>

        <article className="home-stat-card">
          <IoPerson size={22} />
          <div>
            <h3>Productos</h3>
            <p>{productos.length}</p>
          </div>
        </article>

        <article className="home-stat-card">
          <IoRefresh size={22} />
          <div>
            <h3>Estado de la cuenta</h3>
            <p>{currentUser?.estado.toUpperCase() ?? "-"}</p>
          </div>
        </article>
      </section>

      <section className="home-users-card">
        <h2>Información personal</h2>

        <article className="home-article-grid">
          <div className="nombre">
            <p>Nombre:</p>
            <span>{currentUser?.nombre ?? "-"}</span>
          </div>
          <div className="documento">
            <p>Documento:</p>
            <span>
              {currentUser
                ? `${currentUser.tipo_documento ?? "-"} / ${
                    currentUser.numero_documento ?? "-"
                  }`
                : "-"}
            </span>
          </div>
          <div className="username">
            <p>Permisos de Facturacion:</p>
            <span>{currentUser?.permiso_factura.toUpperCase() ?? "-"}</span>
          </div>
          <div className="email">
            <p>Email:</p>
            <span>{currentUser?.email ?? "-"}</span>
          </div>
          <div className="rol">
            <p>Rol:</p>
            <span>{currentUser?.rol ?? "-"}</span>
          </div>
          <div className="movimientos">
            <p>Facturaciones realizadas:</p>
            <span>{currentUser?.numero_facturas ?? "-"}</span>
          </div>
        </article>
      </section>
    </section>
  );
}

export default HomeUser;
