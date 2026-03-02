import { useState } from 'react'
import { useApi } from '../../context/ApiContext'
import { Link, useNavigate } from 'react-router-dom'

import { showErrorAlert, showSuccessAlert } from "../../utils/alerts";
import { IoPersonAddOutline } from "react-icons/io5";
import ButtonToggleTheme from '../../components/ButtonToggleTheme';
import "../../css/auth/register.css";


function RegisterLayout() {

    const navigate = useNavigate();
    const { register} = useApi();
    const [nombre, setNombre] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password_hash, setPassword_hash] = useState("");

    const [loading, setLoading] = useState(false);


    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { 
        event.preventDefault();
        setLoading(true);
        try {
            await register({
                nombre,
                username,
                email,
                password_hash
            });
            await showSuccessAlert("Usuario registrado exitosamente", "Ahora puedes iniciar sesión con tus credenciales");
            navigate("/login");
        } catch (error) {
            await showErrorAlert(error, "Error al registrar usuario");
        } finally { 
            setLoading(false);
        }
    }

    return (
        <div className="register-page">

            <ButtonToggleTheme />

            <form onSubmit={handleSubmit} className="register-card">
            <h1>Registrar nuevo usuario</h1>

            <label htmlFor="nombre">Nombre completo</label>
            <input
                id="nombre"
                placeholder="Nombre completo"
                value={nombre}
                autoComplete="none"
                onChange={(e) => setNombre(e.target.value)}
                required
            />

            <label htmlFor="username">Usuario</label>
            <input
                id="username"
                placeholder="Nombre de Usuario"
                value={username}
                autoComplete="username"
                onChange={(e) => setUsername(e.target.value)}
                required
            />

            <label htmlFor="email">Correo electronico</label>
            <input
                id="email"
                type="email"
                placeholder="exam@ejemplo.com"
                autoComplete="none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />

            <label htmlFor="password">Contraseña</label>
            <input
                id="password"
                type="password"
                placeholder="*****"
                value={password_hash}
                onChange={(e) => setPassword_hash(e.target.value)}
                minLength={8}
                required
            />

            <button
                className="register-submit-btn"
                type="submit"
                disabled={loading}
            >
                <IoPersonAddOutline size={18} />
                <span>{loading ? "Registrando..." : "Registrar"}</span>
            </button>

            <p className="register-footer-text">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
            </form>
        </div>
        );
}

export default RegisterLayout
