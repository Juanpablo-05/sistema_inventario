import { useApi } from '../context/ApiContext'
import { IoSunny, IoMoon } from "react-icons/io5";

import "../css/Button_theme/Button_Theme.css";

function ButtonToggleTheme() {
    const { isDark, toggleTheme } = useApi();

    return (
        <button
        type="button"
        className="login-theme-toggle"
        onClick={toggleTheme}
        aria-label={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
        >
        {isDark ? <IoSunny size={18} /> : <IoMoon size={18} />}
        </button>
    )
}

export default ButtonToggleTheme