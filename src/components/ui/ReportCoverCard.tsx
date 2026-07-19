"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, FileText } from "lucide-react";
import { Report } from "@/services/firestoreService";
import PDFPreviewModal from "./PDFPreviewModal";
import PDFThumbnail from "./PDFThumbnail";

// ── Domain → accent colour ────────────────────────────────────────────────────
const DOMAIN_ACCENT: Record<string, string> = {
    network:    "#4A9B8E",
    networking: "#4A9B8E",
    reseau:     "#4A9B8E",
    pentest:    "#E8621A",
    pentesting: "#E8621A",
    web:        "#E8621A",
    hardening:  "#6B7A8D",
    sysadmin:   "#6B7A8D",
    linux:      "#6B7A8D",
    crypto:     "#B8860B",
    cryptography: "#B8860B",
    forensics:  "#B8860B",
};

function getDomainAccent(domain?: string): string {
    if (!domain) return "#1B6CA8";
    const key = domain.toLowerCase().replace(/[^a-z]/g, "");
    for (const [kw, color] of Object.entries(DOMAIN_ACCENT)) {
        if (key.includes(kw)) return color;
    }
    return "#2C3E50";
}

function formatDate(createdAt: Report["createdAt"], dateOverride?: string): string {
    if (dateOverride) return dateOverride;
    if (!createdAt) return "—";
    try {
        const d =
            typeof createdAt === "object" && "toDate" in createdAt
                ? (createdAt as { toDate: () => Date }).toDate()
                : new Date(createdAt as string | number | Date);
        return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return "—"; }
}

interface ReportCoverCardProps {
    report: Report;
    delay?: number;
}

export default function ReportCoverCard({ report, delay = 0 }: ReportCoverCardProps) {
    const [pdfOpen, setPdfOpen] = useState(false);
    const accent  = getDomainAccent(report.domain);
    const date    = formatDate(report.createdAt, report.dateOverride);

    const isImportedPDF = Boolean(report.importedFileUrl && (report.importedFileType === "pdf" || report.importedFileUrl.toLowerCase().endsWith(".pdf")));

    return (
        <>
            <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay, ease: "easeOut" }}
                className="w-full flex justify-center"
            >
                <div
                    className="group relative flex flex-col aspect-[1/1.414] w-full max-w-[320px] rounded-xl overflow-hidden transition-all duration-200 bg-[#0A1824]"
                    style={{ boxShadow: "0 2px 20px rgba(0,0,0,0.35)" }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${accent}55`;
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.transform = "";
                        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 20px rgba(0,0,0,0.35)";
                    }}
                >
                    {/* ── Cover body (links to report) ── */}
                    <Link href={`/reports/${report.id}`} className="flex flex-col flex-1 h-full relative overflow-hidden">
                        
                        {isImportedPDF ? (
                            /* Render Real Page 1 of the Imported PDF file */
                            <div className="relative w-full h-full flex flex-col justify-between">
                                <div className="absolute inset-0 z-0">
                                    <PDFThumbnail url={report.importedFileUrl!} title={report.title} />
                                </div>

                                {/* Top Accent bar */}
                                <div className="relative z-10 top-0 left-0 right-0 h-1.5" style={{ background: accent }} />

                                {/* Bottom Dark Gradient Title Overlay */}
                                <div className="relative z-10 mt-auto p-3.5 bg-gradient-to-t from-[#0A1824] via-[#0A1824]/90 to-transparent pt-8 flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#3b9fd4] flex items-center gap-1">
                                        <FileText size={11} /> PDF Document ({report.course || "Pentest"})
                                    </span>
                                    <h3 className="text-[12px] sm:text-[13px] font-extrabold text-white leading-snug line-clamp-2">
                                        {report.title}
                                    </h3>
                                    <span className="text-[9px] text-[#5c7d99] font-mono mt-0.5">Rendu : {date}</span>
                                </div>
                            </div>
                        ) : (
                            /* Fallback Academic Template Cover Card for Generated Web Reports */
                            <div className="flex flex-col p-4 flex-1 h-full bg-white dark:bg-gradient-to-b dark:from-[#112030] dark:to-[#0a1824] border border-slate-100 dark:border-[#1a3049]/50 transition-all duration-300 justify-between">
                                {/* Blue Top Accent Line */}
                                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />

                                {/* Top Section */}
                                <div className="flex flex-col items-center w-full">
                                    {/* Centered Dual Logos */}
                                    <div className="w-full flex items-center justify-center gap-2.5 mt-2">
                                        <div className="bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-200/50 flex items-center justify-center max-w-[90px]">
                                            <Image
                                                src="/Logo_EFREI_New.png"
                                                alt="EFREI Paris"
                                                width={90}
                                                height={30}
                                                style={{ height: 18, width: "auto", display: "block", objectFit: "contain" }}
                                            />
                                        </div>
                                        <div className="w-px h-5 bg-slate-200 dark:bg-slate-700/60" />
                                        <div className="relative rounded-full overflow-hidden border border-slate-200/50 shadow-sm w-7 h-7 flex-shrink-0">
                                            <Image
                                                src="/Logo ABBA.jpg"
                                                alt="Massil ABBA"
                                                fill
                                                style={{ objectFit: "cover" }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Middle Section */}
                                <div className="flex flex-col items-center w-full my-auto py-2">
                                    {/* Title */}
                                    <h3
                                        className="text-[12px] sm:text-[13px] font-extrabold leading-snug text-center line-clamp-2 px-1"
                                        style={{
                                            color: accent,
                                            fontFamily: "'Inter', sans-serif",
                                        }}
                                    >
                                        {report.title}
                                    </h3>

                                    {/* Title separator */}
                                    <div className="w-[70%] max-w-[140px] h-[1px] mx-auto my-2 bg-slate-200 dark:bg-slate-700/60" />

                                    {/* Team & Details Info (Centered) */}
                                    <div className="flex flex-col gap-0.5 text-[9px] sm:text-[9.5px] w-full text-slate-600 dark:text-[#9ab3c8]">
                                        <p className="text-center line-clamp-1">
                                            <span className="font-bold text-slate-700 dark:text-white/90">Formation : </span>
                                            <span className="text-slate-500 dark:text-slate-300">{report.subtitle || report.course || "Master 1"}</span>
                                        </p>
                                        <p className="text-center line-clamp-1">
                                            <span className="font-bold text-slate-700 dark:text-white/90">Groupe / Élève : </span>
                                            <span className="text-slate-500 dark:text-slate-300">{report.groupMembers && report.groupMembers.length > 0 ? report.groupMembers.join(", ") : "Massil ABBA"}</span>
                                        </p>
                                        <p className="text-center line-clamp-1">
                                            <span className="font-bold text-slate-700 dark:text-white/90">Date de rendu : </span>
                                            <span className="text-slate-500 dark:text-slate-300">{date}</span>
                                        </p>
                                        {report.tutor && (
                                            <p className="text-center line-clamp-1">
                                                <span className="font-bold text-slate-700 dark:text-white/90">Tuteur référent : </span>
                                                <span className="text-slate-500 dark:text-slate-300">{report.tutor}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* Bottom Section */}
                                <div className="flex flex-col items-center gap-2 w-full mt-auto">
                                    {/* Miniature Campus Sketch Illustration */}
                                    <div className="flex justify-center overflow-hidden rounded-md h-11 sm:h-12 w-[85%] relative">
                                        <Image
                                            src="/efrei_campus_sketch.jpg"
                                            alt="EFREI Campus Courtyard"
                                            fill
                                            style={{ objectFit: "contain" }}
                                            className="opacity-95 dark:invert dark:opacity-80 transition-all duration-300"
                                        />
                                    </div>

                                    {/* Bottom Color Palette Blocks */}
                                    <div className="flex justify-center gap-1 mt-0.5">
                                        {["#C5A880", "#7ED3C1", "#F3A390", "#E8621A", "#795238", "#5A6B7C"].map((color, idx) => (
                                            <div
                                                key={idx}
                                                className="w-4 h-0.5 rounded-sm"
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>

                                    {/* Miniature Card Footer */}
                                    <div className="w-full border-t border-slate-100 dark:border-slate-800/80 pt-2 mt-0.5 flex justify-between items-center text-[8px] text-slate-400 dark:text-[#5c7d99] font-mono">
                                        <span>Rendu : {date}</span>
                                        <span>{report.course || "M1 CSC1"}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Link>

                    {/* ── PDF button — visible on hover absolute overlay ── */}
                    <div
                        className="absolute inset-0 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 px-4 pb-4 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center items-end pointer-events-none"
                    >
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPdfOpen(true); }}
                            aria-label={`Prévisualiser le PDF : ${report.title}`}
                            className="flex items-center justify-center gap-1.5 text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all w-full text-white shadow-lg backdrop-blur-md pointer-events-auto cursor-pointer"
                            style={{
                                background: accent,
                                border: "none",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = "0.9";
                                (e.currentTarget as HTMLElement).style.transform = "scale(1.02)";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.opacity = "1";
                                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
                            }}
                        >
                            <Eye size={12} aria-hidden="true" />
                            View PDF
                        </button>
                    </div>

                    {/* ── Bottom accent bar ── */}
                    <div
                        style={{ height: 5, background: accent, flexShrink: 0 }}
                        aria-hidden="true"
                    />
                </div>
            </motion.div>

            <PDFPreviewModal
                open={pdfOpen}
                onClose={() => setPdfOpen(false)}
                pdfUrl={report.importedFileUrl}
                title={report.title}
            />
        </>
    );
}
