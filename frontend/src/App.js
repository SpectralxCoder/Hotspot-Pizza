import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ConfirmProvider } from "./contexts/ConfirmContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Landing from "./pages/Landing";
import Menu from "./pages/Menu";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import OrderStatus from "./pages/OrderStatus";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminOrders from "./pages/AdminOrders";
import AdminArchive from "./pages/AdminArchive";
import AdminQRCodes from "./pages/AdminQRCodes";
import AdminMenuManager from "./pages/AdminMenuManager";
import AdminCategories from "./pages/AdminCategories";
import AdminSettings from "./pages/AdminSettings";
import KitchenDisplay from "./pages/KitchenDisplay";

export default function App() {
    return (
        <div className="App">
            <ConfirmProvider>
                <SettingsProvider>
                    <AuthProvider>
                        <CartProvider>
                            <BrowserRouter>
                                <Routes>
                                    <Route path="/" element={<Landing />} />
                                    <Route path="/menu" element={<Menu />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/order/:id/confirmation" element={<Confirmation />} />
                                    <Route path="/order/:id" element={<OrderStatus />} />

                                    <Route path="/admin/login" element={<AdminLogin />} />
                                    <Route
                                        path="/admin"
                                        element={
                                            <ProtectedRoute>
                                                <AdminLayout />
                                            </ProtectedRoute>
                                        }
                                    >
                                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                                        <Route path="dashboard" element={<AdminDashboard />} />
                                        <Route path="orders" element={<AdminOrders />} />
                                        <Route path="archive" element={<AdminArchive />} />
                                        <Route path="qrcodes" element={<AdminQRCodes />} />
                                        <Route path="kitchen" element={<KitchenDisplay />} />
                                        <Route path="menu" element={<AdminMenuManager />} />
                                        <Route path="categories" element={<AdminCategories />} />
                                        <Route path="settings" element={<AdminSettings />} />
                                    </Route>

                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Routes>
                                <Toaster
                                    position="bottom-center"
                                    closeButton
                                    toastOptions={{
                                        style: {
                                            background: "#FFFFFF",
                                            color: "#131211",
                                            border: "1px solid #E8DCC8",
                                            borderLeftWidth: "4px",
                                        },
                                    }}
                                />
                            </BrowserRouter>
                        </CartProvider>
                    </AuthProvider>
                </SettingsProvider>
            </ConfirmProvider>
        </div>
    );
}
