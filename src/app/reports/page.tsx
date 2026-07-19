"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { PlusCircle, Search, FileText, BookOpen, Upload } from "lucide-react";
import { getReports, Report, getSettings, SiteSettings } from "@/services/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import ReportCoverCard from "@/components/ui/ReportCoverCard";

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
    const [reports, setReports]               = useState<Report[]>([]);
    const [loading, setLoading]               = useState(true);
    const [searchTerm, setSearchTerm]         = useState("");
    const [settings, setSettings]             = useState<SiteSettings | null>(null);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
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
        return (
            r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.course?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="py-10">
            {/* ─── Header ─── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4 flex-wrap mb-10"
            >
                <div>
                    <h1
                        className="text-[28px] font-bold mb-1.5"
                        style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            color: "var(--text-primary)",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Projects
                    </h1>
                    {/* Accent underline */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.45, delay: 0.15, ease: "easeOut" }}
                        style={{
                            width: 36,
                            height: 2,
                            borderRadius: 2,
                            background: "linear-gradient(90deg, #1B6CA8, #3b9fd4)",
                            transformOrigin: "left",
                            marginBottom: 8,
                        }}
                    />
                    <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                        Rapports d'audit & projets techniques de cybersécurité.
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/reports/new" className="btn-primary">
                        <Upload size={14} aria-hidden="true" /> Importer un Rapport PDF
                    </Link>
                )}
            </motion.div>

            {/* ─── Search Bar ─── */}
            <div className="mb-8">
                <div className="relative w-full">
                    <Search
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "var(--text-muted)" }}
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Rechercher un rapport ou un cours..."
                        aria-label="Search reports"
                        className="search-input w-full"
                        style={{ height: 48, paddingLeft: 44, paddingRight: 16 }}
                    />
                </div>
            </div>

            {/* ─── Grid / Skeleton / Empty state ─── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-xl animate-pulse h-52"
                            style={{
                                background: "var(--bg-card)",
                                border: "1px solid var(--border-color)",
                            }}
                        />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-state text-center p-14 max-w-xl mx-auto relative overflow-hidden"
                >
                    <GridSVG />
                    <div
                        className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-6 relative z-10"
                        style={{
                            background: "rgba(27,108,168,0.08)",
                            border: "1px solid rgba(27,108,168,0.18)",
                            filter: "drop-shadow(0 0 12px rgba(27,108,168,0.4))",
                        }}
                    >
                        <FileText size={22} style={{ color: "#3b9fd4" }} aria-hidden="true" />
                    </div>
                    <h3
                        className="text-[17px] font-bold mb-2 relative z-10"
                        style={{ color: "var(--text-primary)" }}
                    >
                        {searchTerm ? "Aucun rapport trouvé" : "Aucun rapport disponible"}
                    </h3>
                    <p
                        className="text-[13px] mb-8 relative z-10 leading-relaxed"
                        style={{ color: "var(--text-muted)" }}
                    >
                        {searchTerm
                            ? "Essayez de modifier votre terme de recherche."
                            : "Importez votre premier rapport PDF."}
                    </p>
                    {isAdmin && !searchTerm && (
                        <Link href="/reports/new" className="btn-primary relative z-10">
                            <Upload size={14} aria-hidden="true" /> Importer un rapport PDF
                        </Link>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((report, i) => (
                        <ReportCoverCard key={report.id} report={report} delay={i * 0.04} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ReportsPage() {
    return (
        <Suspense
            fallback={
                <div className="py-10">
                    <div
                        className="rounded-xl animate-pulse h-10 w-36 mb-8"
                        style={{ background: "var(--bg-card)" }}
                    />
                </div>
            }
        >
            <ReportsContent />
        </Suspense>
    );
}
