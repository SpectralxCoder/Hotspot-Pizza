import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Lock } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

export default function AdminLogin() {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [creds, setCreds] = useState({ username: "hotspotadmin", password: "" });
    const [submitting, setSubmitting] = useState(false);

    React.useEffect(() => {
        if (isAuthenticated) navigate("/admin/dashboard");
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login(creds.username, creds.password);
            toast.success("Welcome back!");
            navigate("/admin/dashboard");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Invalid credentials");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cream px-4">
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center gap-2.5 mb-6">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand text-white">
                        <Flame className="w-6 h-6" strokeWidth={2.5} />
                    </span>
                    <span className="font-display text-3xl font-extrabold">Hotspot</span>
                </div>
                <div className="bg-white rounded-[28px] p-8 shadow-soft" data-testid="admin-login-card">
                    <h1 className="font-display text-3xl font-extrabold text-center">Admin Login</h1>
                    <p className="text-sm text-muted-foreground text-center mt-1">Manage orders & kitchen</p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold" htmlFor="username">Username</label>
                            <input
                                id="username"
                                type="text"
                                value={creds.username}
                                onChange={(e) => setCreds({ ...creds, username: e.target.value })}
                                className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30"
                                data-testid="admin-username-input"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-sm font-semibold" htmlFor="password">Password</label>
                            <input
                                id="password"
                                type="password"
                                value={creds.password}
                                onChange={(e) => setCreds({ ...creds, password: e.target.value })}
                                placeholder="••••••••"
                                className="mt-1 w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30"
                                data-testid="admin-password-input"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-brand text-white py-3.5 rounded-full font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all inline-flex items-center justify-center gap-2 disabled:opacity-50"
                            data-testid="admin-login-submit"
                        >
                            <Lock className="w-4 h-4" />
                            {submitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>
                    <p className="text-xs text-muted-foreground text-center mt-6">
                        Default: <code className="bg-cream px-1.5 py-0.5 rounded">hotspotadmin</code> / <code className="bg-cream px-1.5 py-0.5 rounded">pizza@123</code>
                    </p>
                </div>
            </div>
        </div>
    );
}
