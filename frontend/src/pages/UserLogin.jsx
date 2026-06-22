import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Flame, ArrowLeft, ChevronLeft } from "lucide-react";
import { useUserAuth } from "../contexts/UserAuthContext";
import { toast } from "sonner";

export default function UserLogin() {
    const { signInWithGoogle, sendOtp, verifyOtp } = useUserAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from || "/menu";

    const [phone, setPhone] = useState("");
    const [token, setToken] = useState("");
    const [step, setStep] = useState("phone");
    const [busy, setBusy] = useState(false);

    const handleGoogle = async () => {
        try {
            setBusy(true);
            const { error } = await signInWithGoogle();
            if (error) toast.error(error.message || "Google sign-in failed");
        } catch (e) {
            toast.error(e.message || "Google sign-in failed");
        } finally {
            setBusy(false);
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (!phone || phone.length < 10) {
            toast.error("Enter a valid phone number with country code (e.g. +91…)");
            return;
        }
        setBusy(true);
        try {
            await sendOtp(phone);
            toast.success("OTP sent to your phone");
            setStep("otp");
        } catch (err) {
            toast.error(err?.message || "Couldn't send OTP. Check Supabase Phone provider config.");
        } finally {
            setBusy(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!token || token.length < 4) {
            toast.error("Enter the OTP code");
            return;
        }
        setBusy(true);
        try {
            await verifyOtp(phone, token);
            toast.success("Welcome!");
            navigate(from, { replace: true });
        } catch (err) {
            toast.error(err?.message || "Invalid or expired OTP");
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-cream">
            <header className="px-4 md:px-8 h-16 flex items-center max-w-7xl mx-auto w-full">
                <button onClick={() => navigate(-1)} className="text-sm font-semibold inline-flex items-center gap-1.5 hover:text-brand" data-testid="login-back">
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
            </header>
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-md">
                    <div className="flex items-center justify-center gap-2.5 mb-6">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand text-white">
                            <Flame className="w-6 h-6" strokeWidth={2.5} />
                        </span>
                        <span className="font-display text-3xl font-extrabold">Hotspot</span>
                    </div>
                    <div className="bg-white rounded-[28px] p-8 shadow-soft" data-testid="user-login-card">
                        <h1 className="font-display text-3xl font-extrabold text-center">Sign in</h1>
                        <p className="text-sm text-muted-foreground text-center mt-1">to place &amp; track your order</p>

                        {step === "phone" && (
                            <>
                                <button
                                    onClick={handleGoogle}
                                    disabled={busy}
                                    className="mt-6 w-full bg-white border-2 border-warmBeige hover:border-brand py-3.5 rounded-full font-semibold inline-flex items-center justify-center gap-2 transition-all"
                                    data-testid="google-signin-button"
                                >
                                    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                                        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.5z"/>
                                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/>
                                        <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.5l-6.5-5.3c-2 1.5-4.6 2.5-7.5 2.5-5.2 0-9.6-3.4-11.2-8l-6.5 5C9.4 39.5 16.1 44 24 44z"/>
                                        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.1-2.2 3.9-4 5.2l6.5 5.3c-.5.5 7.2-5.3 7.2-14.5 0-1.3-.1-2.6-.4-3.5z"/>
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex-1 h-px bg-warmBeige" />
                                    OR
                                    <span className="flex-1 h-px bg-warmBeige" />
                                </div>

                                <form onSubmit={handleSendOtp} className="space-y-3">
                                    <label className="text-sm font-semibold">Phone number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="+91 98XXXXXXXX"
                                        className="w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30"
                                        data-testid="phone-input"
                                    />
                                    <button
                                        type="submit"
                                        disabled={busy}
                                        className="w-full bg-brand text-white py-3.5 rounded-full font-semibold hover:bg-brand-700 disabled:opacity-50 transition-all"
                                        data-testid="send-otp-button"
                                    >
                                        {busy ? "Sending..." : "Send OTP"}
                                    </button>
                                </form>
                            </>
                        )}

                        {step === "otp" && (
                            <form onSubmit={handleVerifyOtp} className="mt-6 space-y-3">
                                <button type="button" onClick={() => setStep("phone")} className="text-sm text-muted-foreground inline-flex items-center gap-1 hover:text-brand" data-testid="otp-change-number">
                                    <ChevronLeft className="w-4 h-4" /> Change number
                                </button>
                                <p className="text-sm">We sent a code to <span className="font-semibold">{phone}</span></p>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={token}
                                    onChange={(e) => setToken(e.target.value)}
                                    placeholder="6-digit code"
                                    className="w-full px-4 py-3 rounded-2xl bg-cream focus:outline-none focus:ring-2 focus:ring-brand/30 text-center text-lg font-bold tracking-widest"
                                    data-testid="otp-input"
                                />
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="w-full bg-brand text-white py-3.5 rounded-full font-semibold hover:bg-brand-700 disabled:opacity-50 transition-all"
                                    data-testid="verify-otp-button"
                                >
                                    {busy ? "Verifying..." : "Verify & Sign in"}
                                </button>
                            </form>
                        )}

                        <p className="text-xs text-muted-foreground text-center mt-6">
                            By signing in you agree to our terms & privacy policy.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
