// Supabase-based user authentication (Google OAuth + Phone OTP)
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";

const UserAuthContext = createContext(null);

export function UserAuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            setLoading(false);
            return;
        }
        let mounted = true;
        supabase.auth.getSession().then(({ data }) => {
            if (!mounted) return;
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        });
        const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s ?? null);
            setUser(s?.user ?? null);
        });
        return () => {
            mounted = false;
            sub?.subscription?.unsubscribe?.();
        };
    }, []);

    const signInWithGoogle = useCallback(async () => {
        if (!isSupabaseConfigured) throw new Error("Supabase not configured");
        return supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
    }, []);

    const sendOtp = useCallback(async (phone) => {
        if (!isSupabaseConfigured) throw new Error("Supabase not configured");
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        return true;
    }, []);

    const verifyOtp = useCallback(async (phone, token) => {
        if (!isSupabaseConfigured) throw new Error("Supabase not configured");
        const { data, error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
        if (error) throw error;
        return data;
    }, []);

    const signOut = useCallback(async () => {
        if (!isSupabaseConfigured) return;
        await supabase.auth.signOut({ scope: "local" });
    }, []);

    return (
        <UserAuthContext.Provider
            value={{
                user,
                session,
                loading,
                isAuthenticated: !!user,
                signInWithGoogle,
                sendOtp,
                verifyOtp,
                signOut,
            }}
        >
            {children}
        </UserAuthContext.Provider>
    );
}

export function useUserAuth() {
    const ctx = useContext(UserAuthContext);
    if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
    return ctx;
}
