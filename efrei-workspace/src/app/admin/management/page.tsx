"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Plus, Search, Edit2, Trash2, ExternalLink,
    Folder, FileText, Cpu, Filter, MoreHorizontal, Settings, Save, Loader2
} from "lucide-react";
import Link from "next/link";
import { getProjects, getReports, getSettings, updateSettings, Project, Report, SiteSettings, DEFAULT_SETTINGS, Course } from "@/services/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminManagementPage() {
    const { isAdmin } = useAuth();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<"projects" | "reports" | "techs" | "settings">("projects");

    useEffect(() => {
        if (!isAdmin) {
            router.push("/dashboard");
            return;
        }

        Promise.all([
            getProjects().catch(() => []),
            getReports().catch(() => []),
            getSettings().catch(() => DEFAULT_SETTINGS)
        ]).then(([p, r, s]) => {
            setProjects(p as Project[]);
            setReports(r as Report[]);
            setSettings(s as SiteSettings);
            setLoading(false);
        });
    }, [isAdmin, router]);

    const handleSaveSettings = async () => {
        setSaving(true);
        try {
            await updateSettings(settings);
            // Optionally show a toast here
        } finally {
            setSaving(false);
        }
    };

    const addCourse = () => {
        setSettings(s => ({
            ...s,
            courses: [...s.courses, { id: Date.now().toString(), name: "New Course", description: "" }]
        }));
    };

    const updateCourse = (index: number, key: keyof Course, value: string) => {
        setSettings(s => {
            const temp = [...s.courses];
            temp[index] = { ...temp[index], [key]: value };
            return { ...s, courses: temp };
        });
    };

    const removeCourse = (index: number) => {
        setSettings(s => ({
            ...s,
            courses: s.courses.filter((_, i) => i !== index)
        }));
    };

    const updateTheme = (key: keyof SiteSettings["theme"], value: string) => {
        setSettings(s => ({
            ...s,
            theme: { ...s.theme, [key]: value }
        }));
    };

    if (!isAdmin) return null;

    const inputStyle: React.CSSProperties = {
        background: "var(--input-bg)",
        border: "1px solid var(--border-color)",
        color: "var(--text-primary)",
        borderRadius: 8,
        fontSize: 13,
        padding: "0 12px",
        height: 36,
        outline: "none",
        width: "100%",
    };

    return (
        <div className="max-w-[1440px] mx-auto py-10 px-8">
            <div className="flex items-end justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
                        Management Portal
                    </h1>
                    <p className="text-[#64748b] font-medium">
                        Control your academic workspace content and resources.
                    </p>
                </div>

                {activeTab !== "settings" && activeTab !== "techs" && (
                    <Link
                        href={activeTab === "projects" ? "/projects/new" : "/reports/new"}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0070f3] text-white font-bold text-sm shadow-premium hover:bg-[#005bc1] transition-all"
                    >
                        <Plus size={18} /> New {activeTab === "projects" ? "Project" : "Report"}
                    </Link>
                )}
                {activeTab === "settings" && (
                    <button
                        onClick={handleSaveSettings}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#10B981] text-white font-bold text-sm transition-all hover:bg-[#059669] disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Save Settings
                    </button>
                )}
            </div>

            {/* Tabs & Search */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                    {[
                        { id: "projects", label: "Projects", icon: Folder },
                        { id: "reports", label: "Reports", icon: FileText },
                        { id: "techs", label: "Technologies", icon: Cpu },
                        { id: "settings", label: "Settings", icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as "projects" | "reports" | "techs" | "settings")}
                            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id
                                    ? "bg-white/10 text-white border border-white/10 shadow-sm"
                                    : "text-[#64748b] hover:text-white hover:bg-white/5"
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab !== "settings" && (
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]" size={16} />
                        <input
                            type="text"
                            placeholder="Search records..."
                            className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                        />
                    </div>
                )}
            </div>

            {/* Content Area */}
            {activeTab !== "settings" ? (
                <div className="glass-card overflow-hidden border-white/5">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/[0.02]">
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">Name / Title</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">Category</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">Status</th>
                                    <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-[#64748b]">Latest Update</th>
                                    <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-[#64748b]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {activeTab === "projects" && projects.map((p) => (
                                    <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-[#44a3ff]">
                                                    <Folder size={14} />
                                                </div>
                                                <p className="font-bold text-sm text-white">{p.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 text-[#94a3b8] uppercase tracking-wider">
                                                {p.course}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`w-1.5 h-1.5 rounded-full ${p.published !== false ? "bg-green-500" : "bg-red-500"}`} />
                                                <span className="text-[12px] font-medium text-[#94a3b8]">
                                                    {p.published !== false ? "Published" : "Hidden"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#64748b] font-medium">Just now</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/projects/${p.id}/edit`} className="p-2 rounded-lg text-[#64748b] hover:text-white hover:bg-white/10 transition-all">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button className="p-2 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-400/10 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {activeTab === "reports" && reports.map((r) => (
                                    <tr key={r.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20 text-[#a78bfa]">
                                                    <FileText size={14} />
                                                </div>
                                                <p className="font-bold text-sm text-white">{r.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 rounded text-[10px] font-bold bg-white/5 text-[#94a3b8] uppercase tracking-wider">
                                                {r.course}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[12px] font-medium text-[#94a3b8]">Generated</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-[#64748b] font-medium">Just now</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/reports/${r.id}/edit`} className="p-2 rounded-lg text-[#64748b] hover:text-white hover:bg-white/10 transition-all">
                                                    <Edit2 size={16} />
                                                </Link>
                                                <button className="p-2 rounded-lg text-[#64748b] hover:text-red-400 hover:bg-red-400/10 transition-all">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {/* Empty state placeholder inside table */}
                                {((activeTab === "projects" && projects.length === 0) || (activeTab === "reports" && reports.length === 0)) && !loading && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-20 text-center">
                                            <div className="max-w-xs mx-auto">
                                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5">
                                                    <Search size={20} className="text-[#64748b]" />
                                                </div>
                                                <p className="text-white font-bold text-sm mb-1">No records found</p>
                                                <p className="text-[12px] text-[#64748b] font-medium">Try adjusting your filters or create a new record.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Courses Settings */}
                    <div className="glass-card p-8 border-white/5">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">Manage Courses</h2>
                            <button onClick={addCourse} className="text-[#3B82F6] text-sm font-bold flex items-center gap-1">
                                <Plus size={16} /> ADD COURSE
                            </button>
                        </div>
                        <div className="space-y-4">
                            {settings.courses.map((course, idx) => (
                                <div key={course.id} className="flex gap-4 items-start p-4 rounded-xl border border-white/5 bg-white/[0.02]">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex gap-3">
                                            <input type="text" value={course.name} placeholder="Course Name" onChange={(e) => updateCourse(idx, "name", e.target.value)} style={inputStyle} />
                                        </div>
                                        <input type="text" value={course.description} placeholder="Short description..." onChange={(e) => updateCourse(idx, "description", e.target.value)} style={inputStyle} />
                                    </div>
                                    <button onClick={() => removeCourse(idx)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors mt-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            {settings.courses.length === 0 && (
                                <p className="text-[#64748b] text-sm italic py-4 text-center">No courses configured.</p>
                            )}
                        </div>
                    </div>

                    {/* Theme Settings */}
                    <div className="glass-card p-8 border-white/5 h-fit">
                        <h2 className="text-xl font-bold text-white mb-6">Theme Context Variables</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Primary Accent Color (#HEX)</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0" style={{ background: settings.theme.primaryAccent }}></div>
                                    <input type="text" value={settings.theme.primaryAccent} onChange={(e) => updateTheme("primaryAccent", e.target.value)} style={inputStyle} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-2">Section Header Background (#HEX)</label>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg border border-white/10 shrink-0" style={{ background: settings.theme.sectionHeaderBg }}></div>
                                    <input type="text" value={settings.theme.sectionHeaderBg} onChange={(e) => updateTheme("sectionHeaderBg", e.target.value)} style={inputStyle} />
                                </div>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-wider mb-4">Cover Page Gradient (Start & End)</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded shrink-0 border border-white/10" style={{ background: settings.theme.coverGradientStart }}></div>
                                        <input type="text" value={settings.theme.coverGradientStart} onChange={(e) => updateTheme("coverGradientStart", e.target.value)} style={{ ...inputStyle, height: 32 }} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded shrink-0 border border-white/10" style={{ background: settings.theme.coverGradientEnd }}></div>
                                        <input type="text" value={settings.theme.coverGradientEnd} onChange={(e) => updateTheme("coverGradientEnd", e.target.value)} style={{ ...inputStyle, height: 32 }} />
                                    </div>
                                </div>
                                <div className="mt-4 h-12 w-full rounded-xl border border-white/10" style={{ background: `linear-gradient(135deg, ${settings.theme.coverGradientStart}, ${settings.theme.coverGradientEnd})` }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Statistics */}
            {activeTab !== "settings" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="glass-card p-6 border-white/5">
                        <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest mb-1">Active Projects</p>
                        <p className="text-3xl font-extrabold text-white">{projects.length}</p>
                    </div>
                    <div className="glass-card p-6 border-white/5">
                        <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest mb-1">Total Reports</p>
                        <p className="text-3xl font-extrabold text-white">{reports.length}</p>
                    </div>
                    <div className="glass-card p-6 border-white/5">
                        <p className="text-[#64748b] text-[11px] font-bold uppercase tracking-widest mb-1">Platform Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <p className="text-xl font-bold text-white uppercase tracking-tight">Optimal</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
