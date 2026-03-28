import { useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { IoCreateOutline } from "react-icons/io5";
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";

type UserApiItem = {
  id: number;
  nombre: string | null;
  username: string;
  email: string | null;
  estado: "activo" | "inactivo";
  rol: "admin" | "empleado";
  permiso_factura: "permitido" | "denegado";
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

type ModalEditUserProps = {
  user: UserApiItem;
  onEdit: (id: number, input: UpdateUserInput) => Promise<void>;
};

function ModalEditUser({ user, onEdit }: ModalEditUserProps) {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState(user.nombre ?? "");
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email ?? "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "empleado">(user.rol);
  const [estado, setEstado] = useState<"activo" | "inactivo">(user.estado);
  const [permisoFactura, setPermisoFactura] = useState<"permitido" | "denegado">(
    user.permiso_factura,
  );

  useEffect(() => {
    if (!show) return;

    setNombre(user.nombre ?? "");
    setUsername(user.username);
    setEmail(user.email ?? "");
    setPassword("");
    setRole(user.rol);
    setEstado(user.estado);
    setPermisoFactura(user.permiso_factura);
  }, [show, user]);

  function handleClose() {
    if (saving) return;
    setShow(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombreTrim = nombre.trim();
    const usernameTrim = username.trim();
    const emailTrim = email.trim();
    const passwordTrim = password.trim();

    if (!nombreTrim || !usernameTrim || !emailTrim) return;

    const payload: UpdateUserInput = {
      nombre: nombreTrim,
      username: usernameTrim,
      email: emailTrim,
      role,
      estado,
      permiso_factura: permisoFactura,
    };

    if (passwordTrim) {
      payload.password_hash = passwordTrim;
    }

    setSaving(true);

    try {
      await onEdit(user.id, payload);
      setShow(false);
      await showSuccessAlert("Usuario actualizado", "Los cambios se guardaron correctamente.");
    } catch (error) {
      await showErrorAlert(error, "No se pudo actualizar el usuario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" variant="warning" onClick={() => setShow(true)}>
        <IoCreateOutline color="black" size={18} />
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Editar usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit} className="form_create-category">
            <input
              value={nombre}
              onChange={(event) => setNombre(event.target.value)}
              placeholder="Nombre completo"
              required
            />
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Nombre de usuario"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Correo electrónico"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Nueva contraseña (opcional)"
            />
            <select value={role} onChange={(event) => setRole(event.target.value as "admin" | "empleado")}>
              <option value="empleado">Empleado</option>
              <option value="admin">Administrador</option>
            </select>
            <select
              value={estado}
              onChange={(event) => setEstado(event.target.value as "activo" | "inactivo")}
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <select
              value={permisoFactura}
              onChange={(event) =>
                setPermisoFactura(event.target.value as "permitido" | "denegado")
              }
            >
              <option value="denegado">Facturación denegada</option>
              <option value="permitido">Facturación permitida</option>
            </select>
            <Button variant="secondary" onClick={handleClose} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} variant="warning">
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalEditUser;
