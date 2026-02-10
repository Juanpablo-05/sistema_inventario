import { createContext, useCallback, useContext, useMemo } from "react";

type ApiContextValue = {
    baseUrl: string;
    request<T>(path: string, init?: RequestInit): Promise<T>;
};

const ApiContext = createContext<ApiContextValue | null>(null);

type ApiProviderProps = {
    baseUrl?: string;
    children: React.ReactNode;
};

export function ApiProvider({ baseUrl, children }: ApiProviderProps) {
    const resolvedBase = baseUrl ?? "http://localhost:3000";

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

    const value = useMemo<ApiContextValue>(
        () => ({ baseUrl: resolvedBase, request }),
        [resolvedBase, request],
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
