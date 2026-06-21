import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminLayout() {
    return (
        <div className="min-h-screen flex bg-[#F8F8F8]">
            <AdminSidebar />
            <div className="flex-1 min-w-0">
                <main className="p-4 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
