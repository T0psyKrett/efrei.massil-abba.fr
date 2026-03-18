"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PlusCircle, Layers, Search } from "lucide-react";
import ProjectCard from "@/components/ui/ProjectCard";
import { getProjects, searchProjects, Project } from "@/services/firestoreService";
import { useAuth } from "@/contexts/AuthContext";

const GridSVG = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}>
        <defs>
            <pattern id="pg" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pg)" />
    </svg>
);

function ProjectsContent() {
    const { isAdmin } = useAuth();
    const searchParams = useSearchParams();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("course") ?? "");

    useEffect(() => {
        (searchTerm ? searchProjects(searchTerm) : getProjects())
            .then((p) => setProjects(p))
            .catch((err) => {
                console.error("Failed to fetch projects:", err);
                setProjects([]);
            })
            .finally(() => setLoading(false));
    }, [searchTerm]);

    const isProjectVisible = (p: Project) => isAdmin || p.published !== false;
    const filtered = projects.filter(isProjectVisible);

    return (
        <div className="py-10">
            {/* ─── Header ─── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4 flex-wrap mb-10"
            >
                <div>
                    <h1 className="text-[28px] font-bold mb-1.5"
                        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        Projects
                    </h1>
                    <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                        Browse and explore academic core projects.
                    </p>
                </div>
                {isAdmin && (
                    <Link href="/projects/new" className="btn-primary">
                        <PlusCircle size={14} /> New Project
                    </Link>
                )}
            </motion.div>

            {/* ─── Search bar ─── */}
            <div className="relative mb-6">
                <Search size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: "var(--text-muted)" }}
                />
                <input
                    type="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search projects or technologies…"
                    className="search-input"
                    style={{ height: 48, paddingLeft: 44, paddingRight: 16 }}
                />
            </div>

            {/* ─── Grid / Empty state ─── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-xl animate-pulse h-44"
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
                            background: "rgba(59,130,246,0.08)",
                            border: "1px solid rgba(59,130,246,0.15)",
                            filter: "drop-shadow(0 0 12px rgba(59,130,246,0.4))",
                        }}>
                        <Layers size={22} style={{ color: "#60a5fa" }} />
                    </div>
                    <h3 className="text-[17px] font-bold mb-2 relative z-10" style={{ color: "var(--text-primary)" }}>
                        {searchTerm ? `No results for "${searchTerm}"` : "No projects yet"}
                    </h3>
                    <p className="text-[13px] mb-8 relative z-10 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                        {searchTerm 
                            ? "Try different search terms or refine your filters." 
                            : (isAdmin ? "Start by creating your first project." : "There are no projects available to display at this time.")
                        }
                    </p>
                    {isAdmin && !searchTerm && (
                        <Link href="/projects/new" className="btn-primary relative z-10">
                            <PlusCircle size={14} /> Create your first project
                        </Link>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((p, i) => (
                        <ProjectCard key={p.id} project={p} delay={i * 0.04} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={
            <div className="py-10">
                <div className="rounded-xl animate-pulse h-10 w-48 mb-8"
                    style={{ background: "var(--bg-card)" }} />
            </div>
        }>
            <ProjectsContent />
        </Suspense>
    );
}
