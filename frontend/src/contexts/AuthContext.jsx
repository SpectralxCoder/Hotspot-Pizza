import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { adminLogin, setAuthToken, verifyAdmin } from "../lib/api";

const AuthContext = createContext(null);
const TOKEN_KEY = "hotspot_admin_token";

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const t = localStorage.getItem(TOKEN_KEY);
        if (!t) {
            setLoading(false);
            return;
        }
        setAuthToken(t);
        verifyAdmin(t)
            .then((res) => {
                if (res?.valid) setUser({ username: res.username });
                else {
                    localStorage.removeItem(TOKEN_KEY);
                    setToken(null);
                }
            })
            .catch(() => {
                localStorage.removeItem(TOKEN_KEY);
                setToken(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = useCallback(async (username, password) => {
        const data = await adminLogin(username, password);
        localStorage.setItem(TOKEN_KEY, data.access_token);
        setToken(data.access_token);
        setAuthToken(data.access_token);
        setUser({ username: data.username });
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
        setToken(null);
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ token, user, loading, login, logout, isAuthenticated: Boolean(user) }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
