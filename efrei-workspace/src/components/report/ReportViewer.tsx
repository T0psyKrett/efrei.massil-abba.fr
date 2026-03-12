"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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

    const coverBg = theme === "dark"
        ? `linear-gradient(145deg, ${settings.theme.coverGradientStart || "#0a0f1e"}, ${settings.theme.coverGradientEnd || "#0d1528"})`
        : "#FFFFFF";
        
    const accentColor = settings.theme.primaryAccent || "#F97316";
    const headerBg = settings.theme.sectionHeaderBg || "#0d1528";

    return (
        <div className="relative min-h-screen pb-32">
            {/* ─── COVER PAGE ─── */}
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="min-h-[85vh] flex flex-col justify-between p-8 sm:p-16 mb-16 rounded-3xl mx-4 sm:mx-8 xl:mx-auto max-w-5xl mt-8 transition-colors duration-300"
                style={{
                    background: coverBg,
                    border: theme === "dark" ? "1px solid rgba(255,255,255,0.05)" : "1px solid var(--border-color)",
                    boxShadow: theme === "dark" ? "0 25px 50px -12px rgba(0,0,0,0.5)" : "var(--card-shadow)"
                }}
            >
                <div>
                    {/* Badges */}
                    <div className="flex items-center gap-3 mb-12">
                        {report.isConfidential !== false && (
                            <span className="text-white text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider" style={{ backgroundColor: accentColor }}>
                                CONFIDENTIEL
                            </span>
                        )}
                        {report.isInternal !== false && (
                            <span className="border border-white/30 text-[11px] font-bold px-3 py-1.5 rounded uppercase tracking-wider"
                                  style={{ color: theme === "dark" ? "white" : "var(--text-primary)", borderColor: theme === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.2)"}}>
                                Usage Interne
                            </span>
                        )}
                    </div>

                    {/* Category Label */}
                    <p className="text-sm font-bold uppercase tracking-[0.2em] mb-4" style={{ color: accentColor }}>
                        {report.categoryLabel || "RAPPORT TECHNIQUE D'INSTALLATION"}
                    </p>

                    {/* Title */}
                    <h1 className="text-4xl sm:text-6xl font-extrabold mb-6"
                        style={{ color: theme === "dark" ? "#FFFFFF" : "#0a0f1e", fontFamily: "var(--font-family-sans)" }}>
                        {report.title}
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[#64748B] text-lg mb-16 max-w-3xl">
                        {report.subtitle || report.course || ""}
                    </p>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-3 border-y py-6 gap-6"
                         style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                        <div className="border-r" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold mb-1">VERSION</p>
                            <p className="font-bold text-sm" style={{ color: theme === "dark" ? "#FFFFFF" : "#09090B" }}>{report.version || "1.0.0"}</p>
                        </div>
                        <div className="border-r" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold mb-1">DATE</p>
                            <p className="font-bold text-sm" style={{ color: theme === "dark" ? "#FFFFFF" : "#09090B" }}>{report.dateOverride || reportDate}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-[#64748B] uppercase tracking-widest font-bold mb-1">DOMAINE</p>
                            <p className="font-bold text-sm" style={{ color: theme === "dark" ? "#FFFFFF" : "#09090B" }}>{report.domain || ""}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Left IP Indicators */}
                {report.ips && report.ips.length > 0 && (
                    <div className="flex flex-wrap items-center gap-6 mt-16 text-[#64748B] text-sm font-medium">
                        {report.ips.map((ip, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ background: ip.color }}></div>
                                <span>{ip.ip} ({ip.label})</span>
                            </div>
                        ))}
                    </div>
                )}
            </motion.div>

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
                                        <Icon size={24} style={{ color: accentColor }} />
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
