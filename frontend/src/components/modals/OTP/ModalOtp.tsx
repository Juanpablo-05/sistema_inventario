import { useRef, useState } from "react";
import { IoClose, IoEye, IoEyeOff, IoKeyOutline } from "react-icons/io5";
import { useApi } from "../../../context/ApiContext";
import { showErrorAlert, showSuccessAlert } from "../../../utils/alerts";
import { useNavigate } from "react-router-dom";
import { getApiErrorInfo } from "../../../utils/apiError";

type ModalOtpProps = {
    isOpen: boolean;
    email: string;
    onClose: () => void;
};

function ModalOtp({ isOpen, email, onClose }: ModalOtpProps) {
    const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

    const { resetPassword } = useApi();
    const navigate = useNavigate();
    if (!isOpen) return null;

    function handleOtpChange(index: number, rawValue: string) {
        const value = rawValue.replace(/\D/g, "").slice(-1);

        setOtpDigits((prev) => {
            const next = [...prev];
            next[index] = value;
            return next;
        });

        if (value && index < otpRefs.current.length - 1) {
            otpRefs.current[index + 1]?.focus();
        }
    }

    function handleOtpKeyDown(
        index: number,
        event: React.KeyboardEvent<HTMLInputElement>,
    ) {
        if (event.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    }

    function handleOtpPaste(event: React.ClipboardEvent<HTMLDivElement>) {
        event.preventDefault();
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;

        setOtpDigits(() => {
            const next = ["", "", "", "", "", ""];
            for (let i = 0; i < 6; i += 1) {
                next[i] = pasted[i] ?? "";
            }
            return next;
        });

        const focusIndex = Math.min(pasted.length, 5);
        otpRefs.current[focusIndex]?.focus();
    }

    function handleModalSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const otp = otpDigits.join("");

        if (newPassword !== confirmPassword) { 
            showErrorAlert(new Error("Por favor, asegúrate de que las contraseñas ingresadas sean iguales."), "Las contraseñas no coinciden");
            return;
        }

        resetPassword({ email, otp, newPassword })
            .then(() => {
                onClose();
                showSuccessAlert("Contraseña restablecida", "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.");
                navigate("/login");
            })
            .catch((error) => {
                const info = getApiErrorInfo(error);
                const alertTitle = info.error ?? "Error al restablecer la contraseña";

                
                if (typeof info.attemptsLeft === "number") {
                    showErrorAlert(new Error(`Intentos restantes: ${info.attemptsLeft}`), alertTitle);
                    return;
                }

                const detail = info.details ?? info.message;
                showErrorAlert(new Error(detail), alertTitle);
                return;
            })
        
        
        
    }

    return (
        <div className="otp-modal-backdrop" role="presentation">
            <section
                className="otp-modal-card"
                role="dialog"
                aria-modal="true"
                aria-labelledby="otp-modal-title"
            >
                <header className="otp-modal-header">
                    <h2 id="otp-modal-title">Verifica tu codigo OTP</h2>
                    <button
                        type="button"
                        className="otp-modal-close-btn"
                        onClick={onClose}
                        aria-label="Cerrar modal"
                    >
                        <IoClose size={20} />
                    </button>
                </header>

                <p className="otp-modal-subtitle">
                    Ingresa el codigo de 6 digitos enviado a{" "}
                    <strong>{email || "tu correo"}</strong>.
                </p>

                <form className="otp-modal-form" onSubmit={handleModalSubmit}>
                    <label htmlFor="otp-digit-0">Codigo OTP</label>
                    <div className="otp-digit-grid" onPaste={handleOtpPaste}>
                        {otpDigits.map((digit, index) => (
                            <input
                                key={`otp-digit-${index + 1}`}
                                id={`otp-digit-${index}`}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                pattern="\d"
                                placeholder="0"
                                value={digit}
                                onChange={(event) => handleOtpChange(index, event.target.value)}
                                onKeyDown={(event) => handleOtpKeyDown(index, event)}
                                ref={(element) => {
                                    otpRefs.current[index] = element;
                                }}
                                className="otp-digit-input"
                                required
                                aria-label={`Digito OTP ${index + 1}`}
                            />
                        ))}
                    </div>

                    <button type="button" className="otp-resend-btn">
                        Reenviar codigo
                    </button>

                    <label htmlFor="new-password">Nueva contraseña</label>
                    <div className="otp-password-input">
                        <input
                            id="new-password"
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Nueva contraseña"
                            value={newPassword}
                            onChange={(event) => setNewPassword(event.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="otp-password-toggle-btn"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            aria-label={showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showNewPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                        </button>
                    </div>

                    <label htmlFor="confirm-password">Confirmar contraseña</label>
                    <div className="otp-password-input">
                        <input
                            id="confirm-password"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirma contraseña"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="otp-password-toggle-btn"
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                            aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showConfirmPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
                        </button>
                    </div>

                    <div className="otp-modal-footer">
                        <button type="button" className="otp-cancel-btn" onClick={onClose}>
                            Cancelar
                        </button>
                        <button type="submit" className="otp-submit-btn">
                            <IoKeyOutline size={18} />
                            <span>Cambiar contraseña</span>
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}

export default ModalOtp;
