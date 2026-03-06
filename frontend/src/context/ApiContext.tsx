import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import type { ApiContextValue, AuthUser, LoginInput, RegisterInput, RequestOptions, ResendOtp, ResetPasswordInput, ThemeMode, ApiErrorData } from "./types/ContextApiTypes";
import { useLocation, useNavigate } from "react-router-dom";


export class ApiError extends Error {
    status: number;
    data: ApiErrorData | string | null;

    constructor(status: number, message: string, data: ApiErrorData | string | null) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}


const ApiContext = createContext<ApiContextValue | null>(null);

type ApiProviderProps = {
    baseUrl?: string;
    children: React.ReactNode;
};

export function ApiProvider({ baseUrl, children }: ApiProviderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const resolvedBase = baseUrl ?? "http://localhost:3000";
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const savedTheme = localStorage.getItem("app-theme");
        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }
        return "light";
    });
    const [isSidebarOpen, setSidebarOpen] = useState<boolean>(() => {
        try {
            return localStorage.getItem("sidebar-open") === "1";
        } catch {
            return false;
        }
    });

    const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
    
    const [user, setUser] = useState<AuthUser | null>(() => {
        const raw = localStorage.getItem("auth_user");
        if (!raw) return null;
        try {
            return JSON.parse(raw) as AuthUser;
        } catch {
            return null;
        }
    });
    const isDark = theme === "dark";
    const isAuthenticated = Boolean(token);

    const clearAuth = useCallback(() => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
    }, []);

    const logout = useCallback(() => {
        clearAuth();
        if (location.pathname !== "/login") {
            navigate("/login", { replace: true });
        }
    }, [clearAuth, location.pathname, navigate]);

    const request = useCallback(
        async <T,>(path: string, init: RequestOptions = {}): Promise<T> => {
            const { skipAuthRedirect = false, ...fetchInit } = init;
            const headers = new Headers(init.headers ?? {});
            if (!headers.has("Content-Type")) {
                headers.set("Content-Type", "application/json");
            }
            if (token && !headers.has("Authorization")) {
                headers.set("Authorization", `Bearer ${token}`);
            }

            const res = await fetch(`${resolvedBase}${path}`, {
                ...fetchInit,
                headers,
            });

            const contentType = res.headers.get("content-type") ?? "";
            const isJson = contentType.includes("application/json");
            const payload = isJson
                ? await res.json().catch(() => null)
                : await res.text().catch(() => "");

            if (!res.ok) {
                if (res.status === 401 && !skipAuthRedirect) {
                    clearAuth();
                    if (location.pathname !== "/login") {
                        navigate("/login", { replace: true });
                    }
                }

                const apiMessage =
                    typeof payload === "object" &&
                    payload !== null &&
                    "error" in payload &&
                    typeof payload.error === "string"
                        ? payload.error
                        : typeof payload === "string" && payload.trim()
                          ? payload
                          : res.statusText;

                throw new ApiError(res.status, `API ${res.status}: ${apiMessage}`, payload as ApiErrorData | string | null);
            }

            if (res.status === 204) {
                return undefined as T;
            }

            return (payload as T) ?? (undefined as T);
        },
        [clearAuth, location.pathname, navigate, resolvedBase, token],
    );

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    const toggleSidebar = useCallback(() => {
        setSidebarOpen((prev) => !prev);
    }, []);

    const login = useCallback(
        async (input: LoginInput): Promise<void> => {
            const data = await request<{
                token: string;
                tokenType: string;
                user?: AuthUser;
            }>("/auth/login", {
                method: "POST",
                body: JSON.stringify(input),
                skipAuthRedirect: true,
            });

            setToken(data.token);
            localStorage.setItem("auth_token", data.token);

            if (data.user) {
                setUser(data.user);
                localStorage.setItem("auth_user", JSON.stringify(data.user));
            }
        },
        [request],
    );

    const register = useCallback(
        async (input: RegisterInput): Promise<void> => {
            const data = await request<{
                token: string;
                tokenType: string;
                user?: AuthUser;
            }>("/auth/register", {
                method: "POST",
                body: JSON.stringify(input),
                skipAuthRedirect: true,
            });

            console.log(data)
        },
        [request],
    );

    const resendOtp = useCallback(
        async (input: ResendOtp): Promise<void> => { 
            const data = await request<{
                email: string;
            }>("/auth/otp", {
                method: "POST",
                body: JSON.stringify(input),
                skipAuthRedirect: true,
            });
            console.log(data)
        }, [request]
    );

    const resetPassword = useCallback(
        async (input: ResetPasswordInput): Promise<void> => { 
            const data = await request<{
                email: string;
                otp: string;
                newPassword: string;
            }>("/auth/reset-password", {
                method: "POST",
                body: JSON.stringify(input),
                skipAuthRedirect: true,
            });
            console.log(data)
        }, [request]
    )

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("app-theme", theme);
    }, [theme]);

    useEffect(() => {
        try {
            localStorage.setItem("sidebar-open", isSidebarOpen ? "1" : "0");
        } catch {
            // no-op si localStorage no está disponible
        }
    }, [isSidebarOpen]);

    const value = useMemo<ApiContextValue>(
        () => ({
            baseUrl: resolvedBase,
            theme,
            isDark,
            isSidebarOpen,
            token,
            user,
            isAuthenticated,
            request,
            login,
            register,
            resendOtp,
            resetPassword,
            logout,
            setTheme,
            setSidebarOpen,
            toggleTheme,
            toggleSidebar,
        }),
        [
            isAuthenticated,
            isDark,
            isSidebarOpen,
            login,
            logout,
            register,
            resendOtp,
            resetPassword,
            request,
            resolvedBase,
            theme,
            toggleTheme,
            toggleSidebar,
            token,
            user,
        ],
    );

    return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi() {
    const ctx = useContext(ApiContext);
    if (!ctx) {
        throw new Error("useApi debe usarse dentro de <ApiProvider>");
    }
    return ctx;
}
