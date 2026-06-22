import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Flame, LayoutDashboard, ListOrdered, Archive, QrCode, ChefHat, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const links = [
    { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard, testid: "admin-nav-dashboard" },
    { to: "/admin/orders", label: "Active Orders", Icon: ListOrdered, testid: "admin-nav-orders" },
    { to: "/admin/kitchen", label: "Kitchen Display", Icon: ChefHat, testid: "admin-nav-kitchen" },
    { to: "/admin/archive", label: "Archive", Icon: Archive, testid: "admin-nav-archive" },
    { to: "/admin/qrcodes", label: "QR Codes", Icon: QrCode, testid: "admin-nav-qrcodes" },
];

export default function AdminSidebar() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/admin/login");
    };

    return (
        <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 bg-white flex-col" data-testid="admin-sidebar">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-brand text-white">
                        <Flame className="w-5 h-5" strokeWidth={2.5} />
                    </span>
                    <span className="font-display text-xl font-extrabold">Hotspot</span>
                </Link>
                <p className="text-xs text-muted-foreground mt-3 tracking-wider uppercase">Admin Console</p>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {links.map(({ to, label, Icon, testid }) => (
                    <NavLink
                        key={to}
                        to={to}
                        data-testid={testid}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                                isActive ? "bg-brand text-white" : "text-foreground hover:bg-cream"
                            }`
                        }
                    >
                        <Icon className="w-4 h-4" />
                        {label}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Signed in as</div>
                <div className="text-sm font-bold mb-3" data-testid="admin-username">{user?.username}</div>
                <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center gap-2 bg-cream text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-warmBeige transition-colors"
                    data-testid="admin-logout-button"
                >
                    <LogOut className="w-4 h-4" />
                    Logout
                </button>
            </div>
        </aside>
    );
}
