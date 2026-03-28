import { useMemo } from "react";
import { formatDate } from "../../utils/normalize";
import "../../css/home/home_page.css";
import { IoConstruct } from "react-icons/io5";
import ModalCreateUser from "../modals/user/ModalCreateUser";
import ModalEditUser from "../modals/user/ModalEditUser";
import ModalDeleteUser from "../modals/user/ModalDeleteUser";
import type { UserItem, UserActionProps } from "./types/HomeUserTypes";

function getUserSortDate(user: UserItem): number {
  const base = user.updated_at ?? user.created_at;
  if (!base) return 0;
  const parsed = new Date(base).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function UserAction({
  users,
  error,
  onCreate,
  onEdit,
  onDelete,
}: UserActionProps) {
  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => getUserSortDate(b) - getUserSortDate(a))
        .slice(0, 6),
    [users],
  );

  return (
    <section className="home-users-table-card">
      <div className="home-users-card-header">
        <h2>Usuarios recientes</h2>
        <ModalCreateUser onCreate={onCreate} />
      </div>
      <div className="home-users-table-wrapper">
        <table className="home-users-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Facturas</th>
              <th>Actualizado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={7} className="home-error">
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
                  <td>{item.estado}</td>
                  <td>{item.numero_facturas ?? 0}</td>
                  <td>{formatDate(item.updated_at ?? item.created_at)}</td>
                  <td>
                    <div className="home-user-actions">
                      <ModalEditUser user={item} onEdit={onEdit} />
                      <ModalDeleteUser
                        id={item.id}
                        nombre={item.nombre}
                        username={item.username}
                        onDelete={onDelete}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UserAction;
