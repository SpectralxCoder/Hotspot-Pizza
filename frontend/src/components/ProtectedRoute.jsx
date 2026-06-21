import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
    const { isAuthenticated, loading } = useAuth();
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream" data-testid="auth-loading">
                <div className="animate-pulse text-muted-foreground">Loading...</div>
            </div>
        );
    }
    if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
    return children;
}
