"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    FileText, ChevronLeft, ChevronRight,
} from "lucide-react";
import Branding from "./Branding";
import { useSidebar } from "@/contexts/SidebarContext";

const SECTIONS = [
    {
        title: "Portfolio",
        links: [
            { label: "Projects", href: "/reports", icon: FileText },
        ],
    },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { collapsed, toggleCollapsed } = useSidebar();

    const sidebarWidth = collapsed ? 64 : 240;

    return (
        <motion.aside
            initial={false}
            animate={{ width: sidebarWidth }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="hidden md:flex flex-col flex-shrink-0 h-[calc(100dvh-64px)] fixed top-[64px] left-0 overflow-hidden"
            aria-label="Main Navigation"
            role="navigation"
            style={{
                background: "var(--sidebar-bg)",
                borderRight: "1px solid var(--border-color)",
                zIndex: 40,
            }}
        >
            <div
                className="flex flex-col h-full overflow-y-auto overflow-x-hidden scrollbar-hide"
                style={{ width: collapsed ? 64 : 240, paddingTop: 20, paddingBottom: 12 }}
            >
                {/* ── Branding (only in expanded mode) ── */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.18 }}
                            className="px-4 mb-6"
                        >
                            <Branding
                                showNames
                                showProfileImage
                                logoSize={32}
                                gap={10}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Nav sections ── */}
                {SECTIONS.map((section, idx) => (
                    <div key={section.title} className={idx !== 0 ? "mt-3" : ""}>
                        <nav
                            className="flex flex-col gap-0.5"
                            style={{ padding: collapsed ? "0 8px" : "0 8px" }}
                        >
                            {section.links.map((link) => {
                                const isActive =
                                    pathname === link.href || pathname?.startsWith(link.href);

                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        aria-label={link.label}
                                        aria-current={isActive ? "page" : undefined}
                                        title={collapsed ? link.label : undefined}
                                        className={`group relative flex items-center rounded-lg text-[13px] font-medium transition-all duration-200 overflow-hidden ${
                                            collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-2.5 px-3 h-[38px]"
                                        } ${
                                            isActive
                                                ? "sidebar-active-item"
                                                : "hover:bg-white/[0.03]"
                                        }`}
                                        style={{
                                            color: isActive
                                                ? "var(--text-primary)"
                                                : "var(--text-muted)",
                                        }}
                                    >
                                        {/* Hover glow background */}
                                        {!isActive && (
                                            <span
                                                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg"
                                                style={{
                                                    background:
                                                        "linear-gradient(90deg, rgba(27,108,168,0.07) 0%, transparent 100%)",
                                                }}
                                            />
                                        )}

                                        {/* Active left accent bar */}
                                        {isActive && !collapsed && (
                                            <span
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                                                style={{
                                                    background: "var(--accent-blue, #1B6CA8)",
                                                    boxShadow:
                                                        "0 0 10px rgba(27,108,168,0.8), 0 0 22px rgba(27,108,168,0.35)",
                                                }}
                                            />
                                        )}

                                        <link.icon
                                            size={collapsed ? 18 : 16}
                                            className="transition-all duration-200 flex-shrink-0 relative z-10"
                                            style={{
                                                color: isActive
                                                    ? "var(--accent-blue, #1B6CA8)"
                                                    : "var(--text-muted)",
                                                filter: isActive
                                                    ? "drop-shadow(0 0 5px rgba(27,108,168,0.8))"
                                                    : "none",
                                            }}
                                        />

                                        {/* Label — hidden when collapsed */}
                                        <AnimatePresence>
                                            {!collapsed && (
                                                <motion.span
                                                    initial={{ opacity: 0, width: 0 }}
                                                    animate={{ opacity: 1, width: "auto" }}
                                                    exit={{ opacity: 0, width: 0 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="flex-1 relative z-10 whitespace-nowrap overflow-hidden"
                                                    style={{ fontFamily: "'Inter', sans-serif" }}
                                                >
                                                    {link.label}
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}

                {/* ── Spacer ── */}
                <div className="flex-1" />

                {/* ── Collapse toggle ── */}
                <div
                    style={{
                        padding: collapsed ? "0 8px 4px" : "0 8px 4px",
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: 10,
                    }}
                >
                    <button
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className={`flex items-center rounded-lg text-[12px] font-medium transition-all duration-200 group ${
                            collapsed ? "justify-center h-10 w-10 mx-auto" : "gap-2 px-3 h-9 w-full"
                        }`}
                        style={{
                            color: "var(--text-muted)",
                            background: "rgba(27,108,168,0.05)",
                            border: "1px solid var(--border-color)",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(27,108,168,0.12)";
                            (e.currentTarget as HTMLElement).style.borderColor = "rgba(27,108,168,0.35)";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(27,108,168,0.05)";
                            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)";
                            (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                        }}
                    >
                        {collapsed ? (
                            <ChevronRight size={15} />
                        ) : (
                            <>
                                <ChevronLeft size={15} />
                                <span>Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </motion.aside>
    );
}
