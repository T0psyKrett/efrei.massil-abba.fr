"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard, Folder, FileText, Search
} from "lucide-react";
import Branding from "./Branding";

const SECTIONS = [
    {
        title: "Workspace",
        links: [
            { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { label: "Projects", href: "/projects", icon: Folder },
            { label: "Reports", href: "/reports", icon: FileText },
        ]
    },
    {
        title: "Tools",
        links: [
            { label: "Search", href: "/search", icon: Search },
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <motion.aside
            initial={false}
            animate={{ width: 240 }}
            className="hidden md:flex flex-col flex-shrink-0 h-[calc(100dvh-64px)] sticky top-[64px] overflow-hidden"
            aria-label="Main Navigation"
            style={{
                background: "var(--sidebar-bg)",
                borderRight: "1px solid var(--border-color)",
                zIndex: 40,
            }}
        >
            <div className="w-[240px] flex flex-col h-full overflow-y-auto overflow-x-hidden py-5 px-3 scrollbar-hide">
                {SECTIONS.map((section, idx) => (
                    <div key={section.title} className={idx !== 0 ? "mt-6" : ""}>
                        <h3 className="px-3 mb-2 text-[11px] uppercase tracking-widest font-bold"
                            style={{ color: "#71717A" }}>
                            {section.title}
                        </h3>
                        <nav className="flex flex-col gap-0.5">
                            {section.links.map((link) => {
                                const isActive = pathname === link.href ||
                                    (link.href !== "/dashboard" && pathname?.startsWith(link.href));
                                return (
                                    <Link
                                        key={link.label}
                                        href={link.href}
                                        className={`group relative flex items-center gap-2.5 px-3 rounded-lg text-[13px] font-medium transition-all duration-150 h-[36px] ${isActive ? "sidebar-active-item" : "hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                                            }`}
                                        style={{
                                            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                                        }}
                                    >
                                        {/* Active left bar — blue glow */}
                                        {isActive && (
                                            <span
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
                                                style={{
                                                    background: "#3B82F6",
                                                    boxShadow: "0 0 8px rgba(59,130,246,0.8)",
                                                }}
                                            />
                                        )}
                                        <link.icon
                                            size={16}
                                            className="transition-colors flex-shrink-0"
                                            style={{
                                                color: isActive ? "#3B82F6" : "var(--text-muted)",
                                                filter: isActive ? "drop-shadow(0 0 3px rgba(59,130,246,0.6))" : "none",
                                            }}
                                        />
                                        <span className="flex-1">{link.label}</span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                ))}
            </div>
        </motion.aside>
    );
}
