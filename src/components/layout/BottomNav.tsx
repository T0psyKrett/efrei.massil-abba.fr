"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
    { href: "/reports", icon: FileText, label: "Projects" },
];

export default function BottomNav() {
    const pathname = usePathname();

    if (pathname === "/") return null;

    return (
        <nav
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-inset-bottom"
            aria-label="Mobile Navigation"
            style={{
                background: "rgba(13,27,42,0.94)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                borderTop: "1px solid #1a3049",
            }}
        >
            <div className="flex items-stretch justify-center" style={{ height: 64 }}>
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href || pathname.startsWith(href);

                    return (
                        <Link
                            key={href}
                            href={href}
                            aria-label={label}
                            aria-current={active ? "page" : undefined}
                            className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 relative max-w-[200px]"
                            style={{
                                color: active ? "#3b9fd4" : "#5c7d99",
                            }}
                        >
                            {/* Top indicator line */}
                            {active && (
                                <motion.div
                                    layoutId="bottom-nav-indicator"
                                    className="absolute inset-x-4 top-0 h-[2px] rounded-full"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, #1B6CA8, #3b9fd4)",
                                        boxShadow: "0 0 8px rgba(27,108,168,0.7)",
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                    }}
                                />
                            )}

                            <Icon
                                size={20}
                                className="flex-shrink-0 transition-all duration-200"
                                aria-hidden="true"
                                style={{
                                    filter: active
                                        ? "drop-shadow(0 0 6px rgba(27,108,168,0.8))"
                                        : "none",
                                }}
                            />
                            <span
                                className="text-[10px] font-semibold tracking-wide"
                                style={{
                                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                                }}
                            >
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
