"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import NetworkBackground from "@/components/background/NetworkBackground";
import Branding from "@/components/layout/Branding";

export default function AdminLoginPage() {
    const { signInWithGoogle } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [attempts, setAttempts] = useState(0);
    const [cooldown, setCooldown] = useState(0);

    const handleGoogleLogin = async () => {
        if (cooldown > 0) return;

        setLoading(true);
        setError("");
        try {
            await signInWithGoogle();
            router.replace("/dashboard");
        } catch (err) {
            const error = err as Error;
            console.error(error);
            const newAttempts = attempts + 1;
            
            if (newAttempts >= 5) {
                setCooldown(60);
                setError("Too many attempts, please wait 60 seconds");
                const timer = setInterval(() => {
                    setCooldown((prev) => {
                        if (prev <= 1) {
                            clearInterval(timer);
                            setAttempts(0);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            } else {
                setError("Access denied. Please use the authorized Google account.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-hidden"
            style={{ background: "#000000" }}
        >
            {/* Network background — more visible */}
            <div className="absolute inset-0 opacity-30 scale-110">
                <NetworkBackground />
            </div>

            {/* Blue radial glow */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.10) 0%, transparent 65%)",
                    zIndex: 1,
                }}
            />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full"
                style={{ maxWidth: 460 }}
            >
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="p-12 rounded-2xl text-center"
                    style={{
                        background: "rgba(255,255,255,0.05)",
                        backdropFilter: "blur(24px)",
                        WebkitBackdropFilter: "blur(24px)",
                        border: "1px solid rgba(255,255,255,0.10)",
                        boxShadow: "0 0 80px rgba(59,130,246,0.12), 0 40px 80px rgba(0,0,0,0.8)",
                    }}
                >
                    {/* Branding logos directly like homepage but scaled for card */}
                    <motion.div
                        className="flex items-center justify-center gap-6 mb-8"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="relative flex items-center justify-center transition-all duration-300">
                            <img
                                src="/Logo_EFREI_New.png"
                                alt="EFREI Paris"
                                style={{ width: 160, height: "auto", objectFit: "contain", borderRadius: 12, overflow: "hidden" }}
                            />
                        </div>

                        <div style={{ width: 1, height: 60, background: "rgba(255,255,255,0.2)" }} />

                        <div className="relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-300"
                            style={{ width: 80, height: 80 }}
                        >
                            <img
                                src="/Logo ABBA.jpg"
                                alt="Massil Abba"
                                style={{ width: 80, height: 80, objectFit: "cover" }}
                            />
                        </div>
                    </motion.div>

                    {/* Shield icon */}
                    <motion.div
                        className="w-14 h-14 mx-auto mb-6 rounded-xl flex items-center justify-center"
                        style={{
                            background: "rgba(59,130,246,0.10)",
                            border: "1px solid rgba(59,130,246,0.25)",
                            color: "#3B82F6",
                            boxShadow: "0 0 24px rgba(59,130,246,0.20)",
                        }}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Shield size={26} />
                    </motion.div>

                    {/* Title + subtitle */}
                    <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.38 }}
                    >
                        <h1 className="text-[22px] font-bold mb-2 tracking-tight" style={{ color: "#FAFAFA" }}>
                            Admin Access
                        </h1>
                        <p className="text-[13px] font-medium" style={{ color: "#71717A" }}>
                            Restricted area — authorized accounts only
                        </p>
                    </motion.div>

                    {/* Divider */}
                    <div className="my-8" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }} />

                    {/* Google Sign-In */}
                    <motion.button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 font-semibold transition-all disabled:opacity-50"
                        style={{
                            height: 52,
                            borderRadius: 10,
                            fontSize: 14,
                            color: "#FAFAFA",
                            background: "#0D0D0D",
                            border: "1px solid rgba(255,255,255,0.18)",
                        }}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.46 }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.01)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 24px rgba(59,130,246,0.22)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.4)";
                            }
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.18)";
                        }}
                    >
                        {loading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : cooldown > 0 ? (
                            <span>Wait {cooldown}s...</span>
                        ) : (
                            <>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </motion.button>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[12px] px-4 py-3 rounded-lg mt-5 font-medium"
                            style={{
                                background: "rgba(239,68,68,0.08)",
                                color: "#f87171",
                                border: "1px solid rgba(239,68,68,0.15)",
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.div
                        className="mt-10 pt-6 flex flex-col items-center gap-4"
                        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.55 }}
                    >
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#3f3f46" }}>
                            Secure Gateway v4
                        </p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="text-[12px] font-medium transition-all"
                            style={{ color: "#71717A" }}
                            onMouseEnter={(e) => e.currentTarget.style.color = "#FAFAFA"}
                            onMouseLeave={(e) => e.currentTarget.style.color = "#71717A"}
                        >
                            ← Return to Dashboard
                        </button>
                    </motion.div>
                </motion.div>
            </motion.div>
        </div>
    );
}
