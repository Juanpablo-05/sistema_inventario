import {
    IoClose,
    IoMenu,
    IoHome,
    IoBarChart,
    IoFileTraySharp,
    IoBag,
    IoSunny,
    IoMoon,
    IoLogOutOutline,
} from "react-icons/io5";

import { useState } from "react";
import { useApi } from "../context/ApiContext";

import { NavLink, Outlet } from "react-router-dom";

export function AppShell() {
    const [isActive, setIsActive] = useState(false);
    const { isDark, toggleTheme, logout } = useApi();

    const navClass =
        (baseClass: string) =>
        ({ isActive }: { isActive: boolean }) =>
        `${baseClass}${isActive ? " active-link" : ""}`;

    return (
        <div className={`container_index ${isDark ? "theme-dark" : "theme-light"}`}>
            <div
                className={
                isActive ? "container_side-bar active" : "container_side-bar"
                }
            >
                <button onClick={() => setIsActive(!isActive)} className="side_bar-btn">
                {isActive ? <IoClose /> : <IoMenu />}
                </button>

                <div className="side_bar-content">
                <div className="side_bar-home">
                    {isActive ? (
                    <NavLink to="/" end className={navClass("side_bar-home-btn")}>
                        inicio
                    </NavLink>
                    ) : (
                    <NavLink to="/" end className={navClass("btn_home-io")}>
                        <IoHome size={20} />
                    </NavLink>
                    )}
                </div>

                <div className="side_bar-category">
                    {isActive ? (
                    <NavLink
                        to="/categories"
                        className={navClass("side_bar-category-btn")}
                    >
                        categorias
                    </NavLink>
                    ) : (
                    <NavLink to="/categories" className={navClass("btn_categoty-io")}>
                        <IoBag size={20} />
                    </NavLink>
                    )}
                </div>
                <div className="side_bar-products">
                    {isActive ? (
                    <NavLink
                        to="/products"
                        className={navClass("side_bar-products-btn")}
                    >
                        productos
                    </NavLink>
                    ) : (
                    <NavLink to="/products" className={navClass("btn_products-io")}>
                        <IoFileTraySharp size={20} />
                    </NavLink>
                    )}
                </div>
                <div className="side_bar-movement">
                    {isActive ? (
                    <NavLink
                        to="/movements"
                        className={navClass("side_bar-movement-btn")}
                    >
                        movimientos
                    </NavLink>
                    ) : (
                    <NavLink to="/movements" className={navClass("btn_movement-io")}>
                        <IoBarChart size={20} />
                    </NavLink>
                    )}
                </div>
                </div>

                <div className="container_btn-dark">
                    <div
                        className={
                        isActive ? "container_circle active" : "container_circle"
                        }
                        onClick={toggleTheme}
                    >
                        <div className={isDark ? "circle active" : "circle"}></div>
                        <IoSunny color="black" size={20}></IoSunny>
                        <IoMoon color="black" size={20}></IoMoon>
                    </div>
                </div>

                <button onClick={logout} className="side_bar-btn" title="Cerrar sesion">
                    <IoLogOutOutline />
                </button>
            </div>

            <Outlet />
        </div>
    );
}
