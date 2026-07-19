"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Report, getSettings, SiteSettings, DEFAULT_SETTINGS } from "@/services/firestoreService";
import { Network, Terminal, Settings as SettingsIcon, Shield, CheckCircle, ArrowRight, Database, Lock, Server, Globe } from "lucide-react";
import PDFExportButton from "./PDFExportButton";
import { useTheme } from "@/contexts/ThemeContext";

interface ReportViewerProps {
    report: Report;
}

const ICON_MAP: Record<string, React.ElementType> = {
    Network, Terminal, Settings: SettingsIcon, Shield, CheckCircle, 
    ArrowRight, Database, Lock, Server, Globe
};

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

function getDomainAccent(domain?: string, defaultColor = "#1B6CA8"): string {
    if (!domain) return defaultColor;
    const key = domain.toLowerCase().replace(/[^a-z]/g, "");
    for (const [kw, color] of Object.entries(DOMAIN_ACCENT)) {
        if (key.includes(kw)) return color;
    }
    return defaultColor;
}

export default function ReportViewer({ report }: ReportViewerProps) {
    const { theme } = useTheme();
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const reportDate = report.createdAt
        ? (typeof report.createdAt === 'object' && 'toDate' in report.createdAt
            ? (report.createdAt as any).toDate()
            : new Date(report.createdAt as any)).toLocaleDateString()
        : "N/A";

    const dynamicAccent = getDomainAccent(report.domain, settings.theme.primaryAccent || "#1B6CA8");
    const headerBg = settings.theme.sectionHeaderBg || "#0d1528";

    return (
        <div className="relative min-h-screen pb-32">
            {/* ─── COVER PAGE (A4 Portrait Mockup) ─── */}
            <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 mt-8 mb-16 flex justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[580px] h-auto sm:aspect-[1/1.414] bg-white dark:bg-gradient-to-br dark:from-[#112030] dark:to-[#0a1824] text-slate-800 dark:text-[#E8EDF2] rounded-2xl relative shadow-[0_12px_40px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.45)] border border-slate-100 dark:border-[#1a3049]/50 overflow-hidden flex flex-col justify-between p-6 sm:p-10 md:p-12"
                >
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1.5" style={{ backgroundColor: dynamicAccent }} />

                    {/* Top Section */}
                    <div className="flex flex-col items-center w-full">
                        {/* Centered Dual Logos */}
                        <div className="w-full flex items-center justify-center gap-4 sm:gap-6 mt-4">
                            <div className="bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-sm border border-slate-200/50 flex items-center justify-center max-w-[140px] sm:max-w-[160px]">
                                <Image
                                    src="/Logo_EFREI_New.png"
                                    alt="EFREI Paris"
                                    width={160}
                                    height={53}
                                    style={{ height: 40, width: "auto", display: "block", objectFit: "contain" }}
                                    priority
                                />
                            </div>
                            <div className="w-px h-8 sm:h-10 bg-slate-200 dark:bg-slate-700/60" />
                            <div className="relative rounded-full overflow-hidden border-2 border-slate-200/50 shadow-sm w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                                <Image
                                    src="/Logo ABBA.jpg"
                                    alt="Massil ABBA"
                                    fill
                                    style={{ objectFit: "cover" }}
                                    priority
                                />
                            </div>
                        </div>
                    </div>

                    {/* Middle Section */}
                    <div className="flex flex-col items-center w-full my-auto py-4 sm:py-6">
                        {/* Title & Separator */}
                        <div className="flex flex-col items-center w-full">
                            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-center px-4 max-w-xl leading-tight" style={{ color: dynamicAccent, fontFamily: "'Inter', sans-serif" }}>
                                {report.title}
                            </h1>
                            <div className="w-[80%] max-w-md h-px bg-slate-200 dark:bg-slate-700/60 mt-4 mb-4" />
                        </div>

                        {/* Metadata Details */}
                        <div className="flex flex-col items-center gap-2 text-[11px] sm:text-xs text-slate-600 dark:text-[#9ab3c8] w-full max-w-md">
                            <p className="text-center">
                                <span className="font-bold text-slate-700 dark:text-white/90">Formation : </span>
                                <span className="text-slate-500 dark:text-slate-300">{report.subtitle || report.course || "Master 1 — Cybersécurité, Réseaux & Cloud"}</span>
                            </p>
                            <p className="text-center">
                                <span className="font-bold text-slate-700 dark:text-white/90">Groupe / Élève : </span>
                                <span className="text-slate-500 dark:text-slate-300">{report.groupMembers && report.groupMembers.length > 0 ? report.groupMembers.join(", ") : "Massil ABBA"}</span>
                            </p>
                            <p className="text-center">
                                <span className="font-bold text-slate-700 dark:text-white/90">Date de rendu : </span>
                                <span className="text-slate-500 dark:text-slate-300">{report.dateOverride || reportDate}</span>
                            </p>
                            {report.tutor && (
                                <p className="text-center">
                                    <span className="font-bold text-slate-700 dark:text-white/90">Tuteur référent : </span>
                                    <span className="text-slate-500 dark:text-slate-300">{report.tutor}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Section */}
                    <div className="flex flex-col items-center w-full gap-4 mt-auto">
                        {/* Campus sketch illustration - large, centered, seamless */}
                        <div className="flex justify-center h-28 sm:h-36 md:h-40 w-full max-w-xs relative overflow-hidden">
                            <Image
                                src="/efrei_campus_sketch.jpg"
                                alt="EFREI Campus Courtyard"
                                fill
                                style={{ objectFit: "contain" }}
                                className="opacity-95 dark:invert dark:opacity-80 transition-all duration-300"
                            />
                        </div>

                        {/* Bottom Accent Blocks */}
                        <div className="flex justify-center gap-1.5 mt-1 mb-4">
                            {["#C5A880", "#7ED3C1", "#F3A390", "#E8621A", "#795238", "#5A6B7C"].map((color, idx) => (
                                <div
                                    key={idx}
                                    className="w-6 h-1 rounded-sm shadow-sm"
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        {/* Footer (Rendering date left, class name right) */}
                        <div className="w-full border-t border-slate-100 dark:border-slate-800/80 pt-3 flex justify-between items-center text-[10px] sm:text-xs text-slate-400 dark:text-[#5c7d99] font-mono">
                            <span>Date de rendu : {report.dateOverride || reportDate}</span>
                            <span>{report.course || "M1 CSC1"}</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ─── SECTIONS ─── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-8">
                {report.sections?.map((section, i) => {
                    const Icon = ICON_MAP[section.icon as keyof typeof ICON_MAP] || Terminal;
                    
                    return (
                        <motion.section
                            key={section.id}
                            id={`section-${section.id}`}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="mb-16"
                        >
                            {/* Section Dark Navy Header */}
                            <div className="rounded-xl p-6 sm:px-8 flex items-center gap-6 mb-8 shadow-lg" style={{ backgroundColor: headerBg }}>
                                <div className="flex-shrink-0">
                                    <p className="text-[#64748B] text-[10px] uppercase tracking-[0.15em] font-bold mb-1">
                                        PHASE {i + 1}
                                    </p>
                                    <div className="flex items-center gap-4">
                                        <span className="text-[#94A3B8] text-2xl font-mono opacity-50">
                                            0{i + 1}
                                        </span>
                                        <Icon size={24} style={{ color: dynamicAccent }} />
                                    </div>
                                </div>
                                <div className="w-px h-12 bg-white/10 mx-2 hidden sm:block"></div>
                                <div>
                                    <h2 className="text-white text-xl sm:text-2xl font-bold">
                                        {section.title}
                                    </h2>
                                </div>
                            </div>

                            {/* Section Content mapping */}
                            {section.blocks && section.blocks.length > 0 ? (
                                <div className="flex flex-col gap-6">
                                    {section.blocks.map(block => {
                                        if (block.type === 'text') {
                                            if (!block.content || block.content === "<p></p>") return null;
                                            let processedHtml = block.content;
                                            processedHtml = processedHtml.replace(/\b(RUNNING)\b/g, '<span class="badge-running">$1</span>');
                                            processedHtml = processedHtml.replace(/\b(WARNING)\b/g, '<span class="badge-warning">$1</span>');
                                            processedHtml = processedHtml.replace(/\b(ERROR)\b/g, '<span class="badge-error">$1</span>');
                                            processedHtml = processedHtml.replace(/\b(INFO)\b/g, '<span class="badge-info">$1</span>');
                                            processedHtml = processedHtml.replace(/<p>(⚠️\s*ATTENTION)/g, '<p class="callout callout-warning">$1');
                                            processedHtml = processedHtml.replace(/<p>(📝\s*NOTE)/g, '<p class="callout callout-info">$1');
                                            processedHtml = processedHtml.replace(/<p>(✅\s*SUCCESS)/g, '<p class="callout callout-success">$1');
                                            processedHtml = processedHtml.replace(/<p>(❌\s*DANGER)/g, '<p class="callout callout-danger">$1');

                                            return (
                                                <div key={block.id} className="prose-report raw-text-wrapper" dangerouslySetInnerHTML={{ __html: processedHtml }} />
                                            );
                                        } else if (block.type === 'image' || block.type === 'code') {
                                            if (!block.content) return null;
                                            return (
                                                <div key={block.id} className="prose-report mac-terminal-wrapper">
                                                    <div className="flex items-center justify-between mb-3 px-1 border-b border-white/5 pb-2 -mt-1 -mx-2">
                                                        <div className="flex items-center gap-[6px]">
                                                            <div className="w-3 h-3 rounded-full bg-[#ff5f57]"></div>
                                                            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
                                                            <div className="w-3 h-3 rounded-full bg-[#28c840]"></div>
                                                        </div>
                                                        <span className="text-[11px] text-gray-400 font-mono opacity-60 truncate max-w-[70%]">
                                                            {block.filename || ""}
                                                        </span>
                                                        <div className="w-12"></div> {/* Spacer for symmetry */}
                                                    </div>
                                                    
                                                    {block.type === 'image' ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={block.content} alt="Block Attachment" className="w-full h-auto object-contain block m-0 rounded-lg" />
                                                    ) : (
                                                        <pre>
                                                            <code>{block.content}</code>
                                                        </pre>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    })}
                                </div>
                            ) : section.content && section.content !== "<p></p>" ? (() => {
                                // Legacy fallback
                                let processedHtml = section.content;
                                processedHtml = processedHtml.replace(/\b(RUNNING)\b/g, '<span class="badge-running">$1</span>');
                                processedHtml = processedHtml.replace(/\b(WARNING)\b/g, '<span class="badge-warning">$1</span>');
                                processedHtml = processedHtml.replace(/\b(ERROR)\b/g, '<span class="badge-error">$1</span>');
                                processedHtml = processedHtml.replace(/\b(INFO)\b/g, '<span class="badge-info">$1</span>');
                                processedHtml = processedHtml.replace(/<p>(⚠️\s*ATTENTION)/g, '<p class="callout callout-warning">$1');
                                processedHtml = processedHtml.replace(/<p>(📝\s*NOTE)/g, '<p class="callout callout-info">$1');
                                processedHtml = processedHtml.replace(/<p>(✅\s*SUCCESS)/g, '<p class="callout callout-success">$1');
                                processedHtml = processedHtml.replace(/<p>(❌\s*DANGER)/g, '<p class="callout callout-danger">$1');

                                const hasTerminal = processedHtml.includes("<pre") || processedHtml.includes("<img");
                                
                                let wrapperClass = "prose-report ";
                                if (hasTerminal) wrapperClass += "mac-terminal-wrapper";
                                else wrapperClass += "raw-text-wrapper";
                                
                                return (
                                    <div key="legacy" className={wrapperClass}>
                                        {hasTerminal && (
                                            <div className="flex items-center gap-1.5 mb-3 px-1">
                                                <div className="w-2 h-2 rounded-full bg-[#ef4444]"></div>
                                                <div className="w-2 h-2 rounded-full bg-[#eab308]"></div>
                                                <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                                                <span className="text-[10px] text-gray-500 font-mono ml-2 uppercase tracking-widest opacity-50">Technical Capture</span>
                                            </div>
                                        )}
                                        <div dangerouslySetInnerHTML={{ __html: processedHtml }} />
                                    </div>
                                );
                            })() : (
                                <p className="text-sm italic" style={{ color: "var(--text-muted)" }}>
                                    This section has not been filled in yet.
                                </p>
                            )}
                        </motion.section>
                    );
                })}
            </div>

            {/* PDF Export Button Fixed Global */}
            <PDFExportButton report={report} settings={settings} />
        </div>
    );
}
