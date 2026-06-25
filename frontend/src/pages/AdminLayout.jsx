import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Menu as MenuIcon, X, LayoutDashboard, ListOrdered, ChefHat, UtensilsCrossed, Tag, Archive, QrCode, Settings, ArrowLeft, Flame, LogOut } from "lucide-react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const LINKS = [
    { to: "/admin/dashboard", label: "Dashboard", Icon: LayoutDashboard, testid: "admin-nav-dashboard" },
    { to: "/admin/orders", label: "Active Orders", Icon: ListOrdered, testid: "admin-nav-orders" },
    { to: "/admin/kitchen", label: "Kitchen Display", Icon: ChefHat, testid: "admin-nav-kitchen" },
    { to: "/admin/menu", label: "Menu Manager", Icon: UtensilsCrossed, testid: "admin-nav-menu" },
    { to: "/admin/categories", label: "Categories", Icon: Tag, testid: "admin-nav-categories" },
    { to: "/admin/archive", label: "Order History", Icon: Archive, testid: "admin-nav-archive" },
    { to: "/admin/qrcodes", label: "QR Codes", Icon: QrCode, testid: "admin-nav-qrcodes" },
    { to: "/admin/settings", label: "Settings", Icon: Settings, testid: "admin-nav-settings" },
];

export default function AdminLayout() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => { logout(); navigate("/admin/login"); };

    return (
        <div className="min-h-screen flex bg-[#F8F8F8]">
            {/* Desktop sidebar */}
            <DesktopSidebar onLogout={handleLogout} username={user?.username} />

            {/* Mobile top bar */}
            <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-warmBeige h-14 flex items-center justify-between px-4">
                <button onClick={() => setDrawerOpen(true)} className="p-2 rounded-full hover:bg-cream" data-testid="admin-drawer-toggle" aria-label="Open menu">
                    <MenuIcon className="w-5 h-5" />
                </button>
                <Link to="/" className="flex items-center gap-2" data-testid="admin-back-to-landing">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-brand text-white"><Flame className="w-4 h-4" strokeWidth={2.5} /></span>
                    <span className="font-display font-extrabold">Hotspot</span>
                </Link>
                <button onClick={() => navigate("/")} className="p-2 rounded-full hover:bg-cream text-xs font-semibold inline-flex items-center gap-1" data-testid="admin-mobile-home">
                    <ArrowLeft className="w-4 h-4" />
                </button>
            </div>

            {/* Mobile drawer */}
            {drawerOpen && (
                <>
                    <div className="md:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setDrawerOpen(false)} data-testid="admin-drawer-backdrop" />
                    <aside className="md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-drawer flex flex-col" data-testid="admin-drawer">
                        <div className="p-5 flex items-center justify-between">
                            <Link to="/" onClick={() => setDrawerOpen(false)} className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-brand text-white"><Flame className="w-5 h-5" strokeWidth={2.5} /></span>
                                <span className="font-display text-xl font-extrabold">Hotspot</span>
                            </Link>
                            <button onClick={() => setDrawerOpen(false)} className="p-2 rounded-full hover:bg-cream" aria-label="Close" data-testid="admin-drawer-close"><X className="w-5 h-5" /></button>
                        </div>
                        <nav className="flex-1 p-4 space-y-1">
                            {LINKS.map(({ to, label, Icon, testid }) => (
                                <NavLink key={to} to={to} onClick={() => setDrawerOpen(false)} data-testid={testid}
                                    className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full text-sm font-semibold transition-all ${isActive ? "bg-brand text-white" : "text-foreground hover:bg-cream"}`}>
                                    <Icon className="w-4 h-4" />
                                    {label}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="p-4 border-t border-warmBeige">
                            <p className="text-xs text-muted-foreground mb-2">Signed in as</p>
                            <p className="text-sm font-bold mb-3">{user?.username}</p>
                            <button onClick={handleLogout} className="w-full inline-flex items-center justify-center gap-2 bg-cream text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-warmBeige" data-testid="admin-mobile-logout">
                                <LogOut className="w-4 h-4" /> Logout
                            </button>
                        </div>
                    </aside>
                </>
            )}

            <div className="flex-1 min-w-0 pt-14 md:pt-0">
                <main className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function DesktopSidebar({ onLogout, username }) {
    const navigate = useNavigate();
    return (
        <aside className="hidden md:flex md:w-64 lg:w-72 shrink-0 bg-white flex-col" data-testid="admin-sidebar">
            <div className="p-6">
                <Link to="/" className="flex items-center gap-2.5">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-brand text-white"><Flame className="w-5 h-5" strokeWidth={2.5} /></span>
                    <span className="font-display text-xl font-extrabold">Hotspot</span>
                </Link>
                <p className="text-xs text-muted-foreground mt-3 tracking-wider uppercase">Admin Console</p>
                <button onClick={() => navigate("/")} className="mt-4 text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-brand" data-testid="admin-back-button">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to site
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {LINKS.map(({ to, label, Icon, testid }) => (
                    <NavLink key={to} to={to} data-testid={testid}
                        className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${isActive ? "bg-brand text-white" : "text-foreground hover:bg-cream"}`}>
                        <Icon className="w-4 h-4" />
                        {label}
                    </NavLink>
                ))}
            </nav>
            <div className="p-4">
                <div className="text-xs text-muted-foreground mb-2">Signed in as</div>
                <div className="text-sm font-bold mb-3" data-testid="admin-username">{username}</div>
                <button onClick={onLogout} className="w-full inline-flex items-center justify-center gap-2 bg-cream text-sm font-semibold px-4 py-2.5 rounded-full hover:bg-warmBeige" data-testid="admin-logout-button">
                    <LogOut className="w-4 h-4" /> Logout
                </button>
            </div>
        </aside>
    );
}
