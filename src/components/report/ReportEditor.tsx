"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Save, Loader2, ArrowLeft, ArrowRight, CheckCircle2, FileEdit } from "lucide-react";
import { Report, ReportSection as IReportSection, DEFAULT_REPORT_SECTIONS, getSettings, SiteSettings, DEFAULT_SETTINGS } from "@/services/firestoreService";
import dynamic from "next/dynamic";

const ReportSection = dynamic(() => import("./ReportSection"), {
    loading: () => <div className="h-40 animate-pulse bg-white/5 rounded-xl" />,
    ssr: false
});
import ImageBlockEditor from "./ImageBlockEditor";

interface ReportEditorProps {
    report?: Partial<Report>;
    projectId: string;
    onSave: (data: Omit<Report, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}

const ICON_OPTIONS = ["Network", "Terminal", "Settings", "Shield", "CheckCircle", "ArrowRight", "Database", "Lock", "Server", "Globe"];

const inputStyle: React.CSSProperties = {
    background: "var(--bg-secondary)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    borderRadius: 10,
    fontSize: 13,
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    width: "100%",
};

const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#3B82F6";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
};
const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--border-color)";
    e.currentTarget.style.boxShadow = "none";
};

export default function ReportEditor({ report, projectId, onSave }: ReportEditorProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [activeSection, setActiveSection] = useState(0);
    const [meta, setMeta] = useState({
        title: report?.title ?? "",
        course: report?.course ?? "",
        subtitle: report?.subtitle ?? "Déploiement Debian 12 · Active Directory · MFA TOTP · SSO Pass-through",
        categoryLabel: report?.categoryLabel ?? "RAPPORT TECHNIQUE D'INSTALLATION",
        isConfidential: report?.isConfidential ?? true,
        isInternal: report?.isInternal ?? true,
        version: report?.version ?? "1.0.0",
        dateOverride: report?.dateOverride ?? "",
        domain: report?.domain ?? "EFREI",
        ips: report?.ips ?? [
            { label: "Gateway", ip: "192.168.1.10", color: "#F97316" },
            { label: "Bastion", ip: "10.0.0.5", color: "#F97316" }
        ],
        published: report?.published ?? true
    });

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const [sections, setSections] = useState<IReportSection[]>(
        report?.sections?.length
            ? report.sections.map(s => ({
                  ...s,
                  blocks: s.blocks?.length ? s.blocks : (s.content ? [{ id: `block-${Date.now()}-legacy-${s.id}`, type: "text", content: s.content }] : []),
                  icon: s.icon || "Terminal"
              }))
            : DEFAULT_REPORT_SECTIONS.map((s, i) => ({ 
                  ...s, 
                  content: "", 
                  blocks: [{ id: `block-${Date.now()}-${i}`, type: "text", content: "" }],
                  icon: "Terminal"
              }))
    );
    const [showCoverSettings, setShowCoverSettings] = useState(false);
    const [showSectionSettings, setShowSectionSettings] = useState(false);

    const moveSection = (idx: number, direction: 'up' | 'down') => {
        if (direction === 'up' && idx > 0) {
            setSections(prev => {
                const ns = [...prev];
                [ns[idx - 1], ns[idx]] = [ns[idx], ns[idx - 1]];
                return ns;
            });
            if (activeSection === idx) setActiveSection(idx - 1);
            else if (activeSection === idx - 1) setActiveSection(idx);
        } else if (direction === 'down' && idx < sections.length - 1) {
            setSections(prev => {
                const ns = [...prev];
                [ns[idx + 1], ns[idx]] = [ns[idx], ns[idx + 1]];
                return ns;
            });
            if (activeSection === idx) setActiveSection(idx + 1);
            else if (activeSection === idx + 1) setActiveSection(idx);
        }
    };

    const addSection = () => {
        const newId = `custom-${Date.now()}`;
        setSections(prev => [...prev, { id: newId, title: "New Section", content: "", placeholder: "Add your content here...", blocks: [{ id: `block-${Date.now()}`, type: "text", content: "" }], icon: "Terminal" }]);
        setActiveSection(sections.length);
    };

    const removeSection = (idx: number) => {
        if (sections.length <= 1) return;
        setSections(prev => prev.filter((_, i) => i !== idx));
        if (activeSection >= idx && activeSection > 0) setActiveSection(activeSection - 1);
    };

    const renameSection = (idx: number, newTitle: string) => {
        setSections(prev => {
            const ns = [...prev];
            ns[idx] = { ...ns[idx], title: newTitle };
            return ns;
        });
    };

    const updateSectionIcon = (idx: number, icon: string) => {
        setSections(prev => {
            const ns = [...prev];
            ns[idx] = { ...ns[idx], icon };
            return ns;
        });
    };

    // Block handlers
    const addBlock = (type: "text" | "image" | "code", sectionIdx: number) => {
        setSections(prev => {
            const ns = [...prev];
            const SectionBlocks = ns[sectionIdx].blocks || [];
            ns[sectionIdx] = { ...ns[sectionIdx], blocks: [...SectionBlocks, { id: `block-${Date.now()}`, type, content: "" }] };
            return ns;
        });
    };

    const moveBlock = (sectionIdx: number, blockIdx: number, direction: 'up' | 'down') => {
        setSections(prev => {
            const ns = [...prev];
            const blocks = [...(ns[sectionIdx].blocks || [])];
            if (direction === 'up' && blockIdx > 0) {
                [blocks[blockIdx - 1], blocks[blockIdx]] = [blocks[blockIdx], blocks[blockIdx - 1]];
            } else if (direction === 'down' && blockIdx < blocks.length - 1) {
                [blocks[blockIdx + 1], blocks[blockIdx]] = [blocks[blockIdx], blocks[blockIdx + 1]];
            }
            ns[sectionIdx] = { ...ns[sectionIdx], blocks };
            return ns;
        });
    };

    const removeBlock = (sectionIdx: number, blockIdx: number) => {
        setSections(prev => {
            const ns = [...prev];
            const blocks = [...(ns[sectionIdx].blocks || [])];
            blocks.splice(blockIdx, 1);
            ns[sectionIdx] = { ...ns[sectionIdx], blocks };
            return ns;
        });
    };

    const handleBlockChange = (sectionIdx: number, blockIdx: number, content: string, filename?: string) => {
        setSections(prev => {
            const ns = [...prev];
            const blocks = [...(ns[sectionIdx].blocks || [])];
            const newBlock = { ...blocks[blockIdx], content };
            const newFilename = filename || blocks[blockIdx].filename;
            if (newFilename) newBlock.filename = newFilename;
            else delete newBlock.filename;
            blocks[blockIdx] = newBlock;
            // Legacy content sync for seamless reading in old code if needed
            ns[sectionIdx] = { ...ns[sectionIdx], blocks, content: blocks.map(b => b.type === 'image' ? `<img src="${b.content}" />` : b.content).join("") };
            return ns;
        });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave({ projectId, ...meta, sections, type: "generated" });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } finally { setSaving(false); }
    };

    const labelClass = "block text-[11px] font-semibold uppercase tracking-widest mb-2";

    const addIp = () => {
        setMeta(m => ({ ...m, ips: [...m.ips, { label: "New Node", ip: "127.0.0.1", color: "#F97316" }] }));
    };
    const updateIp = (index: number, key: keyof typeof meta.ips[0], value: string) => {
        setMeta(m => {
            const newIps = [...m.ips];
            newIps[index] = { ...newIps[index], [key]: value };
            return { ...m, ips: newIps };
        });
    };
    const removeIp = (index: number) => {
        setMeta(m => ({ ...m, ips: m.ips.filter((_, i) => i !== index) }));
    };

    return (
        <div className="py-10">
            <button onClick={() => router.back()}
                className="flex items-center gap-1.5 text-[13px] font-medium mb-8 transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
            >
                <ArrowLeft size={15} /> Back
            </button>

            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.20)" }}>
                        <FileEdit size={17} style={{ color: "#3B82F6" }} />
                    </div>
                    <h1 className="text-[18px] font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        {report?.id ? "Edit Report" : "New Report"}
                    </h1>
                </div>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                    Fill in each section to generate a professional academic report.
                </p>
            </motion.div>

            {/* Meta fields */}
            <div className="glass-card mb-4" style={{ maxWidth: 900, padding: 24 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>
                            Report Title <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <input type="text" placeholder="Report title…" value={meta.title}
                            onChange={(e) => setMeta((m) => ({ ...m, title: e.target.value }))}
                            style={{ ...inputStyle, height: 44, padding: "0 14px" }}
                            onFocus={onFocus} onBlur={onBlur}
                        />
                    </div>
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Course</label>
                        <select value={meta.course}
                            onChange={(e) => {
                                const val = e.target.value;
                                setMeta((m) => ({ ...m, course: val }));
                            }}
                            style={{ ...inputStyle, height: 44, padding: "0 14px", WebkitAppearance: "none" } as React.CSSProperties}
                            onFocus={onFocus} onBlur={onBlur}
                        >
                            <option value="">Select course…</option>
                            {settings.courses.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                {/* Visibility Toggle */}
                <div className="mt-5 pt-5 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                        <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>Report Visibility</p>
                        <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
                            {meta.published ? "Visible to everyone (public)" : "Hidden from guests and users (admin only)"}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer"
                            checked={meta.published}
                            onChange={(e) => setMeta(m => ({ ...m, published: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>

            {/* ─── COVER PAGE (Always Visible Inline) ─── */}
            <h2 className="text-[12px] font-bold uppercase tracking-widest mb-3 mt-10" style={{ color: "#71717A" }}>
                1. Cover Page Details
            </h2>
            <div className="glass-card mb-10" style={{ maxWidth: 900, padding: 24 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Subtitle</label>
                        <input type="text" value={meta.subtitle} onChange={(e) => setMeta(m => ({ ...m, subtitle: e.target.value }))} style={{ ...inputStyle, height: 40, padding: "0 12px" }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Category Label</label>
                        <input type="text" value={meta.categoryLabel} onChange={(e) => setMeta(m => ({ ...m, categoryLabel: e.target.value }))} style={{ ...inputStyle, height: 40, padding: "0 12px" }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-5 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>VERSION</label>
                        <input type="text" value={meta.version} onChange={(e) => setMeta(m => ({ ...m, version: e.target.value }))} style={{ ...inputStyle, height: 40, padding: "0 12px" }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>DATE OVERRIDE</label>
                        <input type="text" value={meta.dateOverride} placeholder="Auto" onChange={(e) => setMeta(m => ({ ...m, dateOverride: e.target.value }))} style={{ ...inputStyle, height: 40, padding: "0 12px" }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>DOMAIN</label>
                        <input type="text" value={meta.domain} onChange={(e) => setMeta(m => ({ ...m, domain: e.target.value }))} style={{ ...inputStyle, height: 40, padding: "0 12px" }} onFocus={onFocus} onBlur={onBlur} />
                    </div>
                </div>

                <div className="flex gap-6 mb-5 pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <label className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-primary)" }}>
                        <input type="checkbox" checked={meta.isConfidential} onChange={(e) => setMeta(m => ({ ...m, isConfidential: e.target.checked }))} className="rounded" />
                        Show CONFIDENTIEL badge
                    </label>
                    <label className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-primary)" }}>
                        <input type="checkbox" checked={meta.isInternal} onChange={(e) => setMeta(m => ({ ...m, isInternal: e.target.checked }))} className="rounded" />
                        Show Usage Interne badge
                    </label>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: "var(--border-color)" }}>
                    <div className="flex items-center justify-between mb-3">
                        <label className={labelClass} style={{ color: "var(--text-muted)", marginBottom: 0 }}>IP Indicators (Bottom Left)</label>
                        <button type="button" onClick={addIp} className="text-[11px] font-bold text-blue-500 hover:text-blue-400 transition-colors">ADD +</button>
                    </div>
                    <div className="flex flex-col gap-3">
                        {meta.ips.map((ipObj, idx) => (
                            <div key={idx} className="flex gap-3">
                                <input type="text" value={ipObj.label} placeholder="Label" onChange={(e) => updateIp(idx, "label", e.target.value)} style={{ ...inputStyle, flex: 1, height: 36, padding: "0 10px" }} onFocus={onFocus} onBlur={onBlur} />
                                <input type="text" value={ipObj.ip} placeholder="192.168..." onChange={(e) => updateIp(idx, "ip", e.target.value)} style={{ ...inputStyle, flex: 2, height: 36, padding: "0 10px" }} onFocus={onFocus} onBlur={onBlur} />
                                <input type="color" value={ipObj.color} onChange={(e) => updateIp(idx, "color", e.target.value)} style={{ width: 44, height: 36, borderRadius: 6, border: "1px solid var(--border-color)", cursor: "pointer", background: "none", padding: 2 }} title="Indicator Color" />
                                <button type="button" onClick={() => removeIp(idx)} className="text-[12px] font-medium text-red-500 w-8 flex justify-center items-center hover:bg-red-500/10 rounded transition-colors" title="Remove IP">✕</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── CONTENT SECTIONS ─── */}
            <div className="flex items-center justify-between mb-3" style={{ maxWidth: 900 }}>
                <h2 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#71717A" }}>
                    2. Content Sections
                </h2>
                <span className="text-[11px] font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded">Freeform Editor</span>
            </div>

            <div className="flex flex-col gap-8 mb-10" style={{ maxWidth: 900 }}>
                {sections.map((section, idx) => (
                    <motion.div key={section.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
                         className="glass-card overflow-hidden shadow-lg border-2" style={{ borderColor: "rgba(59,130,246,0.1)" }}>
                        
                        {/* Section Header Controls */}
                        <div className="flex items-center gap-3 p-3 px-4" style={{ background: "rgba(59,130,246,0.05)", borderBottom: "1px solid var(--border-color)" }}>
                            <div className="flex flex-col gap-0.5">
                                <button type="button" onClick={() => moveSection(idx, 'up')} disabled={idx === 0} 
                                    className="text-[10px] p-0.5 disabled:opacity-20 hover:text-blue-500 transition-colors" title="Move Up">▲</button>
                                <button type="button" onClick={() => moveSection(idx, 'down')} disabled={idx === sections.length - 1} 
                                    className="text-[10px] p-0.5 disabled:opacity-20 hover:text-blue-500 transition-colors" title="Move Down">▼</button>
                            </div>
                            
                            <span className="text-[12px] font-bold tracking-widest text-[#3B82F6] opacity-80 w-6 text-center">
                                {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            
                            <select 
                                value={section.icon || "Terminal"}
                                onChange={(e) => updateSectionIcon(idx, e.target.value)}
                                className="bg-transparent border border-transparent hover:border-[var(--border-color)] focus:border-blue-500 text-[var(--text-primary)] text-xs rounded px-2 py-1 outline-none font-medium cursor-pointer transition-colors"
                            >
                                {ICON_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                            
                            <input type="text" value={section.title} onChange={(e) => renameSection(idx, e.target.value)} 
                                className="font-bold text-[16px] bg-transparent border-none outline-none flex-1"
                                style={{ color: "var(--text-primary)" }}
                                placeholder="Section Title..."
                            />
                            
                            <button type="button" onClick={() => removeSection(idx)} disabled={sections.length === 1} 
                                className="text-[12px] text-red-500 font-bold p-1.5 disabled:opacity-20 hover:bg-red-500/10 rounded transition-colors" title="Delete Section">✕</button>
                        </div>

                        {/* Blocks Rendering */}
                        <div className="p-4 sm:p-6 bg-[var(--bg-secondary)] flex flex-col gap-4">
                            {section.blocks?.map((block, bIdx) => (
                                <div key={block.id} className="relative group border border-transparent hover:border-[var(--border-color)] rounded-xl transition-colors mb-4">
                                    <div className="absolute right-2 top-2 z-10 hidden group-hover:flex items-center bg-[var(--bg-card)] p-1 rounded-md shadow-sm border border-[var(--border-color)]">
                                        <button onClick={() => moveBlock(idx, bIdx, 'up')} disabled={bIdx === 0} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-blue-500 disabled:opacity-30" title="Move Block Up">▲</button>
                                        <button onClick={() => moveBlock(idx, bIdx, 'down')} disabled={bIdx === section.blocks!.length - 1} className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-blue-500 disabled:opacity-30" title="Move Block Down">▼</button>
                                        <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
                                        <button onClick={() => removeBlock(idx, bIdx)} disabled={section.blocks!.length === 1} className="w-6 h-6 flex items-center justify-center text-red-400 hover:text-red-500 disabled:opacity-30 rounded" title="Delete Block">✕</button>
                                    </div>

                                    {block.type === 'text' ? (
                                        <ReportSection
                                            sectionId={block.id}
                                            placeholder="Write content here..."
                                            content={block.content}
                                            projectId={projectId}
                                            onChange={(blockId, html) => handleBlockChange(idx, bIdx, html)}
                                        />
                                    ) : block.type === 'image' ? (
                                        <ImageBlockEditor 
                                            content={block.content}
                                            projectId={projectId}
                                            onChange={(url, filename) => handleBlockChange(idx, bIdx, url, filename)}
                                        />
                                    ) : (
                                        <div className="p-4 bg-[#0d1528] rounded-xl border border-gray-800">
                                            <div className="flex items-center gap-1.5 mb-3 px-1">
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#eab308]"></div>
                                                <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e]"></div>
                                                <span className="text-[10px] text-gray-500 font-mono ml-2 uppercase tracking-widest">Terminal / Code Editor</span>
                                            </div>
                                            <textarea 
                                                value={block.content}
                                                onChange={(e) => handleBlockChange(idx, bIdx, e.target.value)}
                                                placeholder="Paste your code or terminal output here..."
                                                className="w-full min-h-[150px] bg-black/30 text-[#e2e8f0] font-mono text-sm p-4 rounded-lg outline-none border border-white/5 focus:border-blue-500/50 transition-all resize-y"
                                                spellCheck={false}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                                <button type="button" onClick={() => addBlock('text', idx)} className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-blue-500 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                                    + Add Text
                                </button>
                                <button type="button" onClick={() => addBlock('image', idx)} className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-blue-500 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                                    + Add Image
                                </button>
                                <button type="button" onClick={() => addBlock('code', idx)} className="flex items-center gap-2 text-[12px] font-bold text-gray-400 hover:text-blue-500 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                                    + Add Code
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}

                {/* Add New Section Floating Button */}
                <button type="button" onClick={addSection}
                    className="flex justify-center items-center gap-2 p-4 rounded-xl border border-dashed transition-all hover:border-solid group"
                    style={{ borderColor: "var(--border-color-strong)", background: "rgba(255,255,255,0.01)" }}>
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                         <span className="text-blue-500 text-lg font-bold pb-0.5">+</span>
                    </div>
                    <span className="text-[13px] font-bold text-gray-400 group-hover:text-blue-500 transition-colors">Add Content Section</span>
                </button>
            </div>

            {/* Navigation + save / Sticky Bottom Ribbon */}
            <div className="sticky bottom-0 z-50 py-4 mt-12 flex justify-end" style={{ maxWidth: 900, borderTop: "1px solid var(--border-color)", background: "var(--bg-primary)" }}>
                <button onClick={handleSave} disabled={saving || !meta.title}
                    className="flex items-center justify-center gap-2 rounded-xl text-[14px] font-semibold transition-all shadow-xl disabled:opacity-40 w-full sm:w-auto"
                    style={{
                        padding: "0 40px",
                        minHeight: 52,
                        background: saved ? "linear-gradient(135deg, #16a34a, #15803d)" : "linear-gradient(135deg, #3B82F6, #2563EB)",
                        color: "#fff",
                    }}
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {saving ? "Saving to Cloud…" : saved ? "Successfully Saved!" : "Save & Publish Report"}
                </button>
            </div>
        </div>
    );
}
