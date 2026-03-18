"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PlusCircle, X, Loader2, ArrowLeft, FolderPlus } from "lucide-react";
import { createProject } from "@/services/firestoreService";
import { useCourses } from "@/contexts/CourseContext";

const TECH_SUGGESTIONS = ["Linux", "Python", "VMware", "Wireshark", "Metasploit", "Nmap", "OpenSSL", "Docker", "Bash", "Windows Server", "Cisco", "pfSense", "Splunk", "Burp Suite"];

export default function NewProjectPage() {
    const router = useRouter();
    const { courses, refreshSettings } = useCourses();
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", course: "", technologies: [] as string[], tags: [] as string[] });
    const [techInput, setTechInput] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [showAddCourse, setShowAddCourse] = useState(false);
    const [newCourseName, setNewCourseName] = useState("");
    const [addingCourse, setAddingCourse] = useState(false);

    const handleAddCourse = async () => {
        if (!newCourseName.trim() || addingCourse) return;
        setAddingCourse(true);
        try {
            const { addCourse } = await import("@/services/firestoreService");
            const newCourse = await addCourse(newCourseName);
            await refreshSettings();
            setForm(f => ({ ...f, course: newCourse.name }));
            setNewCourseName("");
            setShowAddCourse(false);
        } catch (error) {
            console.error(error);
        } finally {
            setAddingCourse(false);
        }
    };

    // No local useEffect needed for settings as CourseContext handles it

    const addItem = (list: "technologies" | "tags", value: string) => {
        const v = value.trim().toLowerCase();
        if (v && !form[list].includes(v)) setForm((f) => ({ ...f, [list]: [...f[list], v] }));
    };
    const removeItem = (list: "technologies" | "tags", value: string) => {
        setForm((f) => ({ ...f, [list]: f[list].filter((i) => i !== value) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title || !form.course) return;
        setSaving(true);
        try {
            const id = await createProject({ ...form, files: [], published: true, status: "published" });
            router.push(`/projects/${id}`);
        } finally { setSaving(false); }
    };

    const labelClass = "block text-[11px] font-semibold uppercase tracking-widest mb-2";
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
    const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = "#3B82F6";
        e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.12)";
    };
    const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        e.currentTarget.style.borderColor = "var(--border-color)";
        e.currentTarget.style.boxShadow = "none";
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

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="mx-auto glass-card"
                style={{ maxWidth: 680, padding: 32 }}
            >
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(59,130,246,0.10)", border: "1px solid rgba(59,130,246,0.20)" }}>
                        <FolderPlus size={17} style={{ color: "#3B82F6" }} />
                    </div>
                    <h1 className="text-[18px] font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        New Project
                    </h1>
                </div>
                <p className="text-[13px] mb-8" style={{ color: "var(--text-muted)" }}>
                    Create a new academic project in your workspace.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>
                            Project Title <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <input type="text" value={form.title}
                            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                            required placeholder="e.g. Linux Server Hardening Lab"
                            style={{ ...inputStyle, height: 44, padding: "0 14px" }}
                            onFocus={onFocus} onBlur={onBlur}
                        />
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Description</label>
                        <textarea value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            rows={4} placeholder="Brief description of the project scope…"
                            style={{ ...inputStyle, padding: "12px 14px", resize: "none" }}
                            onFocus={onFocus} onBlur={onBlur}
                        />
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>
                            Course <span style={{ color: "#f87171" }}>*</span>
                        </label>
                        <div className="flex flex-col gap-2">
                            <select value={form.course}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === "add_new") {
                                        setShowAddCourse(true);
                                    } else {
                                        setForm((f) => ({ ...f, course: val }));
                                        setShowAddCourse(false);
                                    }
                                }}
                                required
                                style={{ ...inputStyle, height: 44, padding: "0 14px", WebkitAppearance: "none" } as React.CSSProperties}
                                onFocus={onFocus} onBlur={onBlur}
                            >
                                <option value="">Select course…</option>
                                {courses.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
                                <option value="add_new">+ Add course…</option>
                            </select>

                            {showAddCourse && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-2 p-3 rounded-xl"
                                    style={{ background: "rgba(59,130,246,0.05)", border: "1px dashed rgba(59,130,246,0.3)" }}
                                >
                                    <input 
                                        type="text"
                                        value={newCourseName}
                                        onChange={(e) => setNewCourseName(e.target.value)}
                                        placeholder="New course name..."
                                        className="flex-1 bg-transparent border-none outline-none text-[13px]"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                handleAddCourse();
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddCourse}
                                        disabled={!newCourseName.trim() || addingCourse}
                                        className="text-[11px] font-bold text-blue-500 px-2 py-1 rounded hover:bg-blue-500/10"
                                    >
                                        {addingCourse ? "..." : "Save"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddCourse(false)}
                                        className="text-[11px] font-bold text-gray-500 px-2 py-1 rounded hover:bg-gray-500/10"
                                    >
                                        Cancel
                                    </button>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Technologies</label>
                        <input value={techInput} onChange={(e) => setTechInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("technologies", techInput); setTechInput(""); } }}
                            placeholder="Add technology & press Enter…"
                            style={{ ...inputStyle, height: 44, padding: "0 14px", marginBottom: 10 }}
                            onFocus={onFocus} onBlur={onBlur}
                        />
                        <div className="flex flex-wrap gap-2 mb-3">
                            {TECH_SUGGESTIONS.filter((t) => !form.technologies.includes(t.toLowerCase())).slice(0, 8).map((t) => (
                                <button key={t} type="button" onClick={() => addItem("technologies", t)}
                                    className="text-[11px] font-medium rounded-full transition-all"
                                    style={{
                                        padding: "5px 12px",
                                        background: "var(--bg-secondary)",
                                        color: "var(--text-muted)",
                                        border: "1px solid var(--border-color)",
                                        minHeight: "auto",
                                    }}
                                    onMouseEnter={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = "#3B82F6";
                                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.3)";
                                    }}
                                    onMouseLeave={(e) => {
                                        (e.currentTarget as HTMLElement).style.color = "var(--text-muted)";
                                        (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)";
                                    }}
                                >
                                    + {t}
                                </button>
                            ))}
                        </div>
                        {form.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.technologies.map((t) => (
                                    <span key={t} className="flex items-center gap-1.5 rounded-full text-[11px] font-medium"
                                        style={{ padding: "5px 12px", background: "rgba(59,130,246,0.10)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.20)" }}>
                                        {t}
                                        <button type="button" onClick={() => removeItem("technologies", t)}
                                            className="flex items-center justify-center" style={{ minHeight: "auto" }}>
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <label className={labelClass} style={{ color: "var(--text-muted)" }}>Tags</label>
                        <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem("tags", tagInput); setTagInput(""); } }}
                            placeholder="Add tag & press Enter… (e.g. firewall, hardening)"
                            style={{ ...inputStyle, height: 44, padding: "0 14px", marginBottom: 10 }}
                            onFocus={onFocus} onBlur={onBlur}
                        />
                        {form.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {form.tags.map((t) => (
                                    <span key={t} className="flex items-center gap-1.5 rounded-full text-[11px] font-medium"
                                        style={{ padding: "5px 12px", background: "rgba(139,92,246,0.10)", color: "#a78bfa", border: "1px solid rgba(139,92,246,0.20)" }}>
                                        {t}
                                        <button type="button" onClick={() => removeItem("tags", t)}
                                            className="flex items-center justify-center" style={{ minHeight: "auto" }}>
                                            <X size={10} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 24 }}>
                        <button type="submit" disabled={saving || !form.title || !form.course}
                            className="btn-primary w-full justify-center">
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <PlusCircle size={15} />}
                            {saving ? "Creating…" : "Create Project"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
