"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlusCircle, Search, FileText, ArrowRight } from "lucide-react";
import { getReports, Report } from "@/services/firestoreService";
import { useAuth } from "@/contexts/AuthContext";

const GridSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}>
        <defs>
            <pattern id="rg" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rg)" />
    </svg>
);

function ReportsContent() {
    const { isAdmin } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        getReports()
            .then((r) => setReports(r))
            .catch((err) => {
                console.error("Failed to fetch reports:", err);
                setReports([]);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = reports.filter((r) => {
        const isVisible = isAdmin || r.published !== false;
        if (!isVisible) return false;
        
        return r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               r.course?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <div className="py-10">
            {/* ─── Header ─── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4 flex-wrap mb-10"
            >
                <div>
                    <h1 className="text-[28px] font-bold mb-1.5"
                        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        Reports
                    </h1>
                    <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                        Technical documentation and research artifacts.
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/reports/new" className="btn-primary">
                        <PlusCircle size={14} /> New Report
                    </Link>
                )}
            </motion.div>

            {/* ─── Search bar ─── */}
            <div className="relative mb-8">
                <Search size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                />
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search reports or courses…"
                    className="search-input"
                    style={{ height: 48, paddingLeft: 44, paddingRight: 16 }}
                />
            </div>

            {/* ─── Grid / Empty state ─── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-xl animate-pulse h-36"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }} />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-state text-center p-14 max-w-xl mx-auto relative overflow-hidden"
                >
                    <GridSVG />
                    <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-6 relative z-10"
                        style={{
                            background: "rgba(139,92,246,0.08)",
                            border: "1px solid rgba(139,92,246,0.15)",
                            filter: "drop-shadow(0 0 12px rgba(139,92,246,0.4))",
                        }}>
                        <FileText size={22} style={{ color: "#a78bfa" }} />
                    </div>
                    <h3 className="text-[17px] font-bold mb-2 relative z-10" style={{ color: "var(--text-primary)" }}>
                        {searchTerm ? `No reports matching "${searchTerm}"` : "No reports yet"}
                    </h3>
                    <p className="text-[13px] mb-8 relative z-10 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {searchTerm ? "Try broadening your search." : "Start by creating your first technical report."}
                    </p>
                    {isAdmin && !searchTerm && (
                        <Link href="/reports/new" className="btn-primary relative z-10">
                            <PlusCircle size={14} /> Create your first report
                        </Link>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((report, i) => (
                        <motion.div
                            key={report.id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: i * 0.05 }}
                        >
                            <Link href={`/reports/${report.id}`} className="block group h-full">
                                <div className="glass-card p-6 h-full flex flex-col" style={{ minHeight: 140 }}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                                            style={{
                                                background: "rgba(139,92,246,0.08)",
                                                border: "1px solid rgba(139,92,246,0.15)",
                                                filter: "drop-shadow(0 0 5px rgba(139,92,246,0.25))",
                                            }}>
                                            <FileText size={16} style={{ color: "#a78bfa" }} />
                                        </div>
                                        <span className="px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider"
                                            style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
                                            {report.course || "General"}
                                        </span>
                                    </div>
                                    <h3 className="text-[13px] font-semibold mb-2 leading-snug line-clamp-2"
                                        style={{ color: "var(--text-primary)" }}>
                                        {report.title}
                                    </h3>
                                    <div className="mt-auto pt-3 flex items-center justify-between">
                                        <span className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                                            {report.createdAt ? (
                                                typeof report.createdAt === 'object' && 'toDate' in report.createdAt
                                                    ? (report.createdAt as { toDate: () => Date }).toDate().toLocaleDateString()
                                                    : new Date(report.createdAt as string | number | Date).toLocaleDateString()
                                            ) : 'No date'}
                                        </span>
                                        <span className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                                            style={{ color: "#3B82F6" }}>
                                            Read <ArrowRight size={11} />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense fallback={
            <div className="py-10">
                <div className="rounded-xl animate-pulse h-10 w-36 mb-8"
                    style={{ background: "var(--bg-card)" }} />
            </div>
        }>
            <ReportsContent />
        </Suspense>
    );
}
