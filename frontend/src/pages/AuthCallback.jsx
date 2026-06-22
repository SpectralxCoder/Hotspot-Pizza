import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
    const navigate = useNavigate();
    useEffect(() => {
        let mounted = true;
        (async () => {
            await supabase.auth.getSession();
            if (!mounted) return;
            navigate("/menu", { replace: true });
        })();
        return () => { mounted = false; };
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream" data-testid="auth-callback">
            <p className="text-sm text-muted-foreground">Signing you in...</p>
        </div>
    );
}
