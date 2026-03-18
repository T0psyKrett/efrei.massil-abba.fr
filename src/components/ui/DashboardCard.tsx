"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import Link from "next/link";

interface DashboardCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    color?: string;
    delay?: number;
    href?: string;
}

export default function DashboardCard({ title, value, icon: Icon, color = "#3B82F6", delay = 0, href }: DashboardCardProps) {
    const cardContent = (
        <>
            {/* Icon with glow */}
            <div
                className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                    background: `${color}14`,
                    border: `1px solid ${color}28`,
                    filter: `drop-shadow(0 0 6px ${color}60)`,
                }}
            >
                <Icon size={19} style={{ color }} />
            </div>
            {/* Value + Label */}
            <div className="flex-1 min-w-0" style={{ position: "relative", zIndex: 1 }}>
                <p className="font-bold leading-none mb-1.5"
                    style={{ fontSize: 28, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
                    {value}
                </p>
                <p className="font-medium uppercase tracking-widest"
                    style={{ fontSize: 11, color: "#A1A1AA" }}>
                    {title}
                </p>
            </div>
        </>
    );

    const innerClasses = "stat-card flex items-center gap-4 hover:shadow-lg transition-transform hover:-translate-y-1";
    const innerStyle = { padding: "20px 24px" };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay, ease: "easeOut" }}
        >
            {href ? (
                <Link href={href} className={innerClasses} aria-label={`View all ${title}`} style={{ ...innerStyle, display: 'flex' }}>
                    {cardContent}
                </Link>
            ) : (
                <div className={innerClasses} style={innerStyle}>
                    {cardContent}
                </div>
            )}
        </motion.div>
    );
}
