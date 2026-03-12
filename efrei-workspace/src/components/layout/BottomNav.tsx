"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Folder, FileText, Search } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { href: "/dashboard", icon: Home, label: "Home" },
    { href: "/projects", icon: Folder, label: "Projects" },
    { href: "/reports", icon: FileText, label: "Reports" },
    { href: "/search", icon: Search, label: "Search" },
];

export default function BottomNav() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
            aria-label="Mobile Navigation"
            style={{
                background: "rgba(0,0,0,0.85)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
        >
            <div className="flex items-stretch" style={{ height: 60 }}>
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const active = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative"
                            style={{
                                color: active ? "#3B82F6" : "#71717A",
                                minHeight: 48,
                            }}
                        >
                            {active && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute inset-x-3 top-0 h-0.5 rounded-full"
                                    style={{ background: "#3B82F6" }}
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                />
                            )}
                            <Icon size={19} className="flex-shrink-0" />
                            <span className="text-[10px] font-semibold">{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
