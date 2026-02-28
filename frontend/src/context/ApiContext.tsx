import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

type ThemeMode = "light" | "dark";

type AuthUser = {
    id: number;
    username: string;
    role: string;
};

type LoginInput = {
    username: string;
    password_hash: string;
};

type RequestOptions = RequestInit & {
    skipAuthRedirect?: boolean;
};

type ApiContextValue = {
    baseUrl: string;
    request<T>(path: string, init?: RequestOptions): Promise<T>;
    theme: ThemeMode;
    isDark: boolean;
    token: string | null;
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (input: LoginInput) => Promise<void>;
    logout: () => void;
    setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
    toggleTheme: () => void;
};

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

            if (!res.ok) {
                if (res.status === 401 && !skipAuthRedirect) {
                    clearAuth();
                    if (location.pathname !== "/login") {
                        navigate("/login", { replace: true });
                    }
                }
                const text = await res.text().catch(() => "");
                throw new Error(`API ${res.status}: ${text || res.statusText}`);
            }

            return (await res.json()) as T;
        },
        [clearAuth, location.pathname, navigate, resolvedBase, token],
    );

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
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

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("app-theme", theme);
    }, [theme]);

    const value = useMemo<ApiContextValue>(
        () => ({
            baseUrl: resolvedBase,
            theme,
            isDark,
            token,
            user,
            isAuthenticated,
            request,
            login,
            logout,
            setTheme,
            toggleTheme,
        }),
        [isAuthenticated, isDark, login, logout, request, resolvedBase, theme, toggleTheme, token, user],
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
