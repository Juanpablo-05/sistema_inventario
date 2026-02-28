import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import { IoLogInOutline, IoEye, IoEyeOff, IoSunny, IoMoon } from "react-icons/io5";

import { useApi } from "../../context/ApiContext";
import { showErrorAlert, showSuccessAlert } from "../../utils/alerts";
import "../../css/auth/login.css";


function LoginLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isDark, toggleTheme } = useApi();
  const [username, setUsername] = useState("");
  const [password_hash, setPassword_hash] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ username, password_hash });
      const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      showSuccessAlert("¡Bienvenido!", `Has iniciado sesión como ${username}`);
      navigate(fromPath || "/", { replace: true });
    } catch (err) {
      await showErrorAlert(
        err,
        "No se pudo iniciar sesion, revisa tus credenciales e intenta de nuevo",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      >
        {isDark ? <IoSunny size={18} /> : <IoMoon size={18} />}
      </button>

      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Iniciar sesion</h1>

        <label htmlFor="username">Usuario o correo</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="usuario o correo@dominio.com"
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <div className="showPassword">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password_hash}
            onChange={(event) => setPassword_hash(event.target.value)}
            autoComplete="current-password"
            required
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            type="button"
            className="show-password-btn"
            aria-label={showPassword ? "Ocultar password" : "Mostrar password"}
            title={showPassword ? "Ocultar password" : "Mostrar password"}
          >
            {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
          </button>
        </div>

        <button type="submit" disabled={loading} className="login-submit-btn">
          <IoLogInOutline size={18} />
          <span>{loading ? "Entrando..." : "Entrar"}</span>
        </button>
      </form>
    </div>
  );
}

export default LoginLayout;
