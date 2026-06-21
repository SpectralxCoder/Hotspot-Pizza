import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import { CartProvider } from "./contexts/CartContext";
import { AuthProvider } from "./contexts/AuthContext";
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
import KitchenDisplay from "./pages/KitchenDisplay";

export default function App() {
    return (
        <div className="App">
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
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                style: {
                                    background: "#FFFFFF",
                                    color: "#1A1A1A",
                                    border: "1px solid #F0E6DA",
                                    borderLeftWidth: "4px",
                                },
                            }}
                        />
                    </BrowserRouter>
                </CartProvider>
            </AuthProvider>
        </div>
    );
}
