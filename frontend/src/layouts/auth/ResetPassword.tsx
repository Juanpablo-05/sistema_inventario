import { useState } from "react";
import { Link } from "react-router-dom";
import { IoMailOpenOutline } from "react-icons/io5";
import { useApi } from "../../context/ApiContext";

import ButtonToggleTheme from "../../components/ButtonToggleTheme";
import ModalOtp from "../../components/modals/OTP/ModalOtp";
import "../../css/auth/reset_password.css";

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const { resendOtp } = useApi();
    
    function handleOpenOtpModal(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        resendOtp({ email });
        setIsOtpModalOpen(true);
        console.log(email);
    }

  return (
    <div className="reset-page">
      <ButtonToggleTheme />

      <form className="reset-card" onSubmit={handleOpenOtpModal}>
        <h1>Recuperar contraseña</h1>
        <p className="reset-subtitle">
          Ingresa tu correo y te enviaremos un codigo OTP para restablecer tu
          contraseña.
        </p>

        <label htmlFor="reset-email">Correo electronico</label>
        <input
          id="reset-email"
          type="email"
          placeholder="usuario@dominio.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />

        <button type="submit" className="reset-submit-btn">
          <IoMailOpenOutline size={18} />
          <span>Enviar codigo OTP</span>
        </button>

        <p className="reset-footer-text">
          ¿Recordaste tu contraseña? <Link to="/login">Volver al login</Link>
        </p>
      </form>

      <ModalOtp
        isOpen={isOtpModalOpen}
        email={email}
        onClose={() => setIsOtpModalOpen(false)}
      />
    </div>
  );
}

export default ResetPassword;
