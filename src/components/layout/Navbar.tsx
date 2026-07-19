"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Moon, Sun, Shield, LogOut } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import Image from "next/image";
import { useEffect } from "react";

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { isAdmin, signOut }   = useAuth();
    const router = useRouter();

    // ── "/" key shortcut → Search ──
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            const tag = (e.target as HTMLElement).tagName;
            if (
                e.key === "/" &&
                !e.metaKey &&
                !e.ctrlKey &&
                tag !== "INPUT" &&
                tag !== "TEXTAREA" &&
                tag !== "SELECT"
            ) {
                e.preventDefault();
                router.push("/search");
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [router]);

    return (
        <nav
            className="fixed top-0 left-0 right-0 z-50"
            aria-label="Top Navigation"
            style={{
                height: 64,
                background: "var(--nav-bg)",
                backdropFilter: "blur(14px) saturate(1.8)",
                WebkitBackdropFilter: "blur(14px) saturate(1.8)",
                borderBottom: "1px solid var(--border-color)",
            }}
        >
            {/* Shimmer bottom line */}
            <div className="nav-shimmer" aria-hidden="true" />

            <div className="w-full h-full flex items-center justify-between pl-5 pr-5 relative">

                {/* ─── LEFT — empty / spacer ─── */}
                <div />

                {/* ─── RIGHT ─── */}
                <div className="flex items-center gap-3 flex-shrink-0">

                    {/* "/" shortcut hint */}
                    <span
                        className="hidden lg:flex items-center text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{
                            color: "var(--text-muted)",
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-color)",
                        }}
                        title="Press / to open Search"
                        aria-label="Press / to open Search"
                    >
                        /
                    </span>

                    {/* Admin badge + sign out */}
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <div
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider"
                                style={{
                                    background: "rgba(27,108,168,0.10)",
                                    color: "#3b9fd4",
                                    border: "1px solid rgba(27,108,168,0.25)",
                                }}
                            >
                                <Shield size={11} aria-hidden="true" /> Admin
                            </div>
                            <button
                                onClick={signOut}
                                aria-label="Sign out"
                                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg font-bold transition-all"
                                style={{
                                    color: "var(--text-muted)",
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border-color)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.color = "var(--text-primary)";
                                    e.currentTarget.style.borderColor = "rgba(27,108,168,0.4)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.color = "var(--text-muted)";
                                    e.currentTarget.style.borderColor = "var(--border-color)";
                                }}
                            >
                                <LogOut size={13} aria-hidden="true" />
                                <span className="hidden sm:inline">Sign out</span>
                            </button>
                        </div>
                    )}

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                        className="relative flex items-center rounded-full transition-all duration-200 focus:outline-none flex-shrink-0"
                        style={{
                            width: 56,
                            height: 28,
                            background: theme === "dark" ? "rgba(27,108,168,0.10)" : "rgba(0,0,0,0.05)",
                            border: theme === "dark" ? "1px solid rgba(27,108,168,0.3)" : "1px solid var(--border-color)",
                        }}
                    >
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                width: 22, height: 22, top: 2,
                                background: theme === "dark" ? "linear-gradient(135deg, #1B6CA8, #3b9fd4)" : "#FFFFFF",
                                boxShadow: theme === "dark" ? "0 0 8px rgba(27,108,168,0.7)" : "0 2px 4px rgba(0,0,0,0.1)",
                            }}
                            initial={false}
                            animate={{ left: theme === "dark" ? 30 : 2 }}
                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                        <div className="relative z-10 flex items-center w-full justify-between px-[6px] pointer-events-none">
                            <Sun size={12} aria-hidden="true" style={{ color: theme === "dark" ? "var(--text-muted)" : "#09090B" }} />
                            <Moon size={12} aria-hidden="true" style={{ color: theme === "dark" ? "#fff" : "var(--text-muted)" }} />
                        </div>
                    </button>

                    {/* Avatar */}
                    <Link
                        href="/admin/login"
                        aria-label="Admin login"
                        className="flex items-center rounded-full overflow-hidden transition-all duration-300 flex-shrink-0"
                        style={{ boxShadow: "0 0 0 2px var(--border-color)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px #1B6CA8, 0 0 16px rgba(27,108,168,0.45)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 2px var(--border-color)";
                        }}
                    >
                        <Image
                            src="/Logo ABBA.jpg"
                            alt="Massil Abba"
                            width={34}
                            height={34}
                            className="rounded-full object-cover"
                        />
                    </Link>
                </div>
            </div>
        </nav>
    );
}
