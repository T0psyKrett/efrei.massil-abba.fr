"use client";
export const dynamic = 'force-dynamic';

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, X, Layers } from "lucide-react";
import ProjectCard from "@/components/ui/ProjectCard";
import { searchProjects, Project } from "@/services/firestoreService";

const GridSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}>
        <defs>
            <pattern id="sg" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#sg)" />
    </svg>
);

export default function SearchPage() {
    const [value, setValue] = useState("");
    const [results, setResults] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async (term: string) => {
        setValue(term);
        if (!term.trim()) { setResults([]); setSearched(false); return; }
        setLoading(true);
        try { setResults(await searchProjects(term)); }
        catch { setResults([]); }
        setSearched(true);
        setLoading(false);
    };

    return (
        <div className="py-10">
            {/* ─── Hero header ─── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto mb-12 text-center"
            >
                <h1 className="text-[28px] font-bold mb-3"
                    style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                    Global Search
                </h1>
                <p className="text-[14px] mb-8" style={{ color: "var(--text-muted)" }}>
                    Find projects across all academic domains and technologies.
                </p>

                <div className="relative group">
                    <Search size={20}
                        className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"
                        style={{ color: "var(--text-muted)" }}
                    />
                    <input
                        type="search"
                        value={value}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search for anything…"
                        autoFocus
                        className="search-input"
                        style={{ height: 60, paddingLeft: 52, paddingRight: 48, fontSize: 16, borderRadius: 14 }}
                    />
                    {value && (
                        <button
                            onClick={() => handleSearch("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg transition-all"
                            style={{ background: "var(--bg-secondary)", color: "var(--text-muted)" }}
                            aria-label="Clear"
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </motion.div>

            {/* ─── Loading skeletons ─── */}
            {loading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="rounded-xl animate-pulse h-44"
                            style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }} />
                    ))}
                </div>
            )}

            {/* ─── No results ─── */}
            {!loading && searched && results.length === 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-state text-center p-14 max-w-xl mx-auto relative overflow-hidden"
                >
                    <GridSVG />
                    <div className="w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-6 relative z-10"
                        style={{
                            background: "rgba(99,102,241,0.08)",
                            border: "1px solid rgba(99,102,241,0.15)",
                            filter: "drop-shadow(0 0 12px rgba(99,102,241,0.5))",
                        }}>
                        <Layers size={22} style={{ color: "#818cf8" }} />
                    </div>
                    <h3 className="text-[17px] font-bold mb-2 relative z-10" style={{ color: "var(--text-primary)" }}>
                        No matching projects
                    </h3>
                    <p className="text-[13px] relative z-10" style={{ color: "var(--text-muted)" }}>
                        Try searching for technologies like &quot;React&quot; or specific domain topics.
                    </p>
                </motion.div>
            )}

            {/* ─── Idle state ─── */}
            {!loading && !searched && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                    <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-5 opacity-30"
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                        <Search size={24} style={{ color: "var(--text-muted)" }} />
                    </div>
                    <p className="text-[12px] font-bold uppercase tracking-widest opacity-30" style={{ color: "var(--text-muted)" }}>
                        Search the platform
                    </p>
                </motion.div>
            )}

            {/* ─── Results ─── */}
            {!loading && results.length > 0 && (
                <>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "#71717A" }}>
                        {results.length} result{results.length !== 1 ? "s" : ""}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.map((p, i) => <ProjectCard key={p.id} project={p} delay={i * 0.04} />)}
                    </div>
                </>
            )}
        </div>
    );
}
