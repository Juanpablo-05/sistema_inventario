import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

type ThemeMode = "light" | "dark";

type ApiContextValue = {
    baseUrl: string;
    request<T>(path: string, init?: RequestInit): Promise<T>;
    theme: ThemeMode;
    isDark: boolean;
    setTheme: React.Dispatch<React.SetStateAction<ThemeMode>>;
    toggleTheme: () => void;
};

const ApiContext = createContext<ApiContextValue | null>(null);

type ApiProviderProps = {
    baseUrl?: string;
    children: React.ReactNode;
};

export function ApiProvider({ baseUrl, children }: ApiProviderProps) {
    const resolvedBase = baseUrl ?? "http://localhost:3000";
    const [theme, setTheme] = useState<ThemeMode>(() => {
        const savedTheme = localStorage.getItem("app-theme");
        if (savedTheme === "dark" || savedTheme === "light") {
            return savedTheme;
        }
        return "light";
    });
    const isDark = theme === "dark";

    const request = useCallback(
        async <T,>(path: string, init: RequestInit = {}): Promise<T> => {
            const res = await fetch(`${resolvedBase}${path}`, {
                headers: {
                    "Content-Type": "application/json",
                    ...(init.headers ?? {}),
                },
                ...init,
            });

            if (!res.ok) {
                const text = await res.text().catch(() => "");
                throw new Error(`API ${res.status}: ${text || res.statusText}`);
            }

            return (await res.json()) as T;
        },
        [resolvedBase],
    );

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("app-theme", theme);
    }, [theme]);

    const value = useMemo<ApiContextValue>(
        () => ({ baseUrl: resolvedBase, request, theme, isDark, setTheme, toggleTheme }),
        [resolvedBase, request, theme, isDark, toggleTheme],
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
