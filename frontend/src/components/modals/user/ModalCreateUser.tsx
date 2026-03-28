import { useState } from "react";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";

type CreateUserInput = {
  nombre: string;
  username: string;
  email: string;
  password_hash: string;
  role: "admin" | "empleado";
  estado?: "activo" | "inactivo";
  permiso_factura?: "permitido" | "denegado";
};

type ModalCreateUserProps = {
  onCreate: (input: CreateUserInput) => Promise<void>;
};

function ModalCreateUser({ onCreate }: ModalCreateUserProps) {
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nombre, setNombre] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "empleado">("empleado");
  const [estado, setEstado] = useState<"activo" | "inactivo">("activo");
  const [permisoFactura, setPermisoFactura] = useState<"permitido" | "denegado">("denegado");

  function resetForm() {
    setNombre("");
    setUsername("");
    setEmail("");
    setPassword("");
    setRole("empleado");
    setEstado("activo");
    setPermisoFactura("denegado");
  }

  function handleClose() {
    if (saving) return;
    setShow(false);
  }

  function handleShow() {
    resetForm();
    setShow(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nombreTrim = nombre.trim();
    const usernameTrim = username.trim();
    const emailTrim = email.trim();
    const passwordTrim = password.trim();

    if (!nombreTrim || !usernameTrim || !emailTrim || !passwordTrim) return;

    setSaving(true);

    try {
      await onCreate({
        nombre: nombreTrim,
        username: usernameTrim,
        email: emailTrim,
        password_hash: passwordTrim,
        role,
        estado,
        permiso_factura: permisoFactura,
      });

      setShow(false);
      resetForm();
      await showSuccessAlert("Usuario creado", "El usuario se registró correctamente.");
    } catch (error) {
      await showErrorAlert(error, "No se pudo crear el usuario");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button type="button" variant="primary" className="home-users-create-btn" onClick={handleShow}>
        Crear usuario
      </Button>

      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Crear usuario</Modal.Title>
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
              placeholder="Contraseña"
              required
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
            <Button type="submit" disabled={saving} variant="primary">
              {saving ? "Guardando..." : "Crear usuario"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ModalCreateUser;
