"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, Shield, LogOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import Branding from "./Branding";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { isAdmin, signOut } = useAuth();
    const router = useRouter();

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50 transition-all duration-150"
            aria-label="Top Navigation"
            style={{
                height: 64,
                background: "var(--nav-bg)",
                backdropFilter: "blur(12px) saturate(1.8)",
                WebkitBackdropFilter: "blur(12px) saturate(1.8)",
                borderBottom: "1px solid var(--border-color)",
            }}
        >
            {/* ── Shimmer line ── */}
            <div className="nav-shimmer" />

            <div className="w-full h-full flex items-center justify-between pl-6 pr-6 relative">
                {/* ─── LEFT ─── */}
                <div className="flex items-center">
                    <Link href="/dashboard" className="transition-opacity hover:opacity-80">
                        <Branding showNames={false} showProfileImage={true} logoSize={36} gap={10} />
                    </Link>
                </div>

                {/* ─── RIGHT ─── */}
                <div className="flex items-center ml-auto gap-5">
                    {/* Admin section */}
                    {isAdmin && (
                        <div className="flex items-center gap-4">
                            <div
                                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                                style={{
                                    background: "rgba(59, 130, 246, 0.08)",
                                    color: "#3B82F6",
                                    border: "1px solid rgba(59, 130, 246, 0.2)",
                                }}
                            >
                                <Shield size={11} /> Admin
                            </div>
                            <button
                                onClick={signOut}
                                className="flex items-center gap-2 text-[11px] px-3 py-1.5 rounded-lg font-bold transition-all"
                                style={{ 
                                    color: "var(--text-muted)",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border-color)"
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--text-primary)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                                    e.currentTarget.style.borderColor = "var(--border-color-strong)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                                    e.currentTarget.style.borderColor = "var(--border-color)";
                                }}
                            >
                                <LogOut size={13} /> 
                                <span className="hidden sm:inline">Sign out</span>
                            </button>
                        </div>
                    )}

                    {/* ABBA Logo Right — Gateway to Admin Login */}
                    <Link 
                        href="/admin/login"
                        className="hidden sm:flex items-center rounded-full overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]"
                    >
                        <Image
                            src="/Logo ABBA.jpg"
                            alt="Admin Login"
                            width={36}
                            height={36}
                            className="rounded-full object-cover"
                        />
                    </Link>

                    {/* Theme toggle (Apple style pill) */}
                    <button
                        onClick={toggleTheme}
                        className="relative flex items-center rounded-full transition-colors focus:outline-none flex-shrink-0"
                        style={{
                            width: 60,
                            height: 30,
                            background: theme === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)",
                            border: "1px solid var(--border-color)",
                        }}
                        aria-label="Toggle theme"
                    >
                        {/* Sliding thumb */}
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                width: 24,
                                height: 24,
                                top: 2,
                                background: theme === "dark" ? "#27272A" : "#FFFFFF",
                                boxShadow: theme === "dark" ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 4px rgba(0,0,0,0.1)",
                                border: theme === "dark" ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.05)",
                            }}
                            initial={false}
                            animate={{
                                left: theme === "dark" ? 32 : 2,
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        {/* Icons */}
                        <div className="relative z-10 flex items-center w-full justify-between px-[7px] pointer-events-none">
                            <Sun size={13} style={{ color: theme === "dark" ? "#71717A" : "#09090B", transition: "color 0.2s" }} />
                            <Moon size={13} style={{ color: theme === "dark" ? "#FAFAFA" : "#A1A1AA", transition: "color 0.2s" }} />
                        </div>
                    </button>
                </div>
            </div>
        </nav>
    );
}
