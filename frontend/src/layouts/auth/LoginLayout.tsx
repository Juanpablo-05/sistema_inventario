import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { IoLogInOutline } from "react-icons/io5";
import { useApi } from "../../context/ApiContext";
import "../../css/auth/login.css";

function LoginLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useApi();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isAuthenticated) {
    return <Navigate to="/categories" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login({ username, password });
      const fromPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(fromPath || "/categories", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesion");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Iniciar sesion</h1>

        <label htmlFor="username">Usuario</label>
        <input
          id="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />

        {error ? <p className="login-error">{error}</p> : null}

        <button type="submit" disabled={loading}>
          <IoLogInOutline size={18} />
          <span>{loading ? "Entrando..." : "Entrar"}</span>
        </button>
      </form>
    </div>
  );
}

export default LoginLayout;
