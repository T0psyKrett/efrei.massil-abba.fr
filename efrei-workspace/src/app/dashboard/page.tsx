"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
    FolderOpen, FileText, Cpu, PlusCircle,
    ArrowRight, Layers, FilePlus, Search,
} from "lucide-react";
import DashboardCard from "@/components/ui/DashboardCard";
import ProjectCard from "@/components/ui/ProjectCard";
import { subscribeToProjects, subscribeToReports, Project, Report } from "@/services/firestoreService";
import { useAuth } from "@/contexts/AuthContext";
import { SkeletonCard, SkeletonStats } from "@/components/ui/Skeletons";

/* SVG wireframe grid for the empty state */
const GridSVG = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%" height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.04, pointerEvents: "none" }}
    >
        <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
);

const actionLinkStyle = {
    display: "flex" as const,
    alignItems: "center" as const,
    gap: 8,
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
    textDecoration: "none",
    transition: "border-color 0.15s",
    cursor: "pointer",
};

export default function DashboardPage() {
    const { isAdmin } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubProjects = subscribeToProjects((p: Project[]) => {
            setProjects(p);
            setLoading(false);
        });

        const unsubReports = subscribeToReports((r: Report[]) => {
            setReports(r);
            setLoading(false);
        });

        return () => {
            unsubProjects();
            unsubReports();
        };
    }, []);

    const visibleProjects = isAdmin ? projects : projects.filter((p) => p.published !== false);
    const visibleReports = isAdmin ? reports : reports.filter((r) => r.published !== false);
    const allTechs = [...new Set(visibleProjects.flatMap((p) => p.technologies ?? []))];

    return (
        <div className="pt-8 pb-10 sm:pt-10 sm:pb-12">

            {/* ─── Page header ─── */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start justify-between gap-4 flex-wrap mb-10"
            >
                <div>
                    <h1 className="text-[28px] font-bold mb-1.5"
                        style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        Dashboard
                    </h1>
                    {/* Animated accent underline */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0 }}
                        animate={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                        style={{
                            width: 40,
                            height: 2,
                            borderRadius: 2,
                            background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                            transformOrigin: "left",
                            marginBottom: 8,
                        }}
                    />
                    <p className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>
                        Academic Cybersecurity Portfolio —{" "}
                        <span style={{ color: "#3B82F6" }}>2026 Edition</span>
                    </p>
                </div>
                {isAdmin && (
                    <div className="flex items-center gap-3">
                        <Link href="/reports/new" className="btn-secondary flex items-center gap-2">
                            <FilePlus size={14} /> New Report
                        </Link>
                        <Link href="/projects/new" className="btn-primary">
                            <PlusCircle size={14} /> New Project
                        </Link>
                    </div>
                )}
            </motion.div>

            {/* ─── Stat cards ─── */}
            {loading ? (
                <SkeletonStats />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <DashboardCard href="/projects" title="Projects" value={visibleProjects.length} icon={FolderOpen} color="#3B82F6" delay={0} />
                    <DashboardCard href="/reports" title="Reports" value={visibleReports.length} icon={FileText} color="#8B5CF6" delay={0.05} />
                    <DashboardCard href="/technologies" title="Technologies" value={allTechs.length} icon={Cpu} color="#10B981" delay={0.10} />
                </div>
            )}

            {/* ─── Quick Actions ─── */}
            {isAdmin && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="mb-10"
                >
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#71717A" }}>
                        Quick Actions
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                        <Link href="/projects/new" style={actionLinkStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-color-strong)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}>
                            <PlusCircle size={14} style={{ color: "#3B82F6" }} /> New Project
                        </Link>
                        <Link href="/reports/new" style={actionLinkStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-color-strong)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}>
                            <FilePlus size={14} style={{ color: "#8B5CF6" }} /> New Report
                        </Link>
                        <Link href="/search" style={actionLinkStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-color-strong)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}>
                            <Search size={14} style={{ color: "#10B981" }} /> Browse Projects
                        </Link>
                    </div>
                </motion.div>
            )}

            {/* ─── Featured Projects header ─── */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "#71717A" }}>
                    Featured Projects
                </h2>
                <Link href="/projects"
                    className="flex items-center gap-1.5 text-[12px] font-semibold transition-all group"
                    style={{ color: "#3B82F6" }}>
                    Browse catalog{" "}
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>

            {/* ─── Projects grid or empty state ─── */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(6)].map((_, i) => (
                        <SkeletonCard key={i} delay={i * 0.05} />
                    ))}
                </div>
            ) : visibleProjects.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="empty-state text-center p-10 max-w-md mx-auto relative overflow-hidden"
                >
                    <GridSVG />
                    <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-5 relative z-10"
                        style={{
                            background: "rgba(99,102,241,0.08)",
                            border: "1px solid rgba(99,102,241,0.15)",
                            filter: "drop-shadow(0 0 12px rgba(99,102,241,0.5))",
                        }}>
                        <Layers size={20} style={{ color: "#818cf8" }} />
                    </div>
                    <h3 className="text-[16px] font-bold mb-1.5 relative z-10" style={{ color: "var(--text-primary)" }}>
                        No projects yet
                    </h3>
                    {isAdmin ? (
                        <>
                            <p className="text-[13px] mb-6 relative z-10 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                Start by creating your first project.
                            </p>
                            <Link href="/projects/new" className="btn-primary relative z-10">
                                <PlusCircle size={14} /> Create your first project
                            </Link>
                        </>
                    ) : (
                        <p className="text-[13px] mb-2 relative z-10 leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            There are currently no featured projects to display.
                        </p>
                    )}
                </motion.div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visibleProjects.slice(0, 6).map((p, i) => (
                        <ProjectCard key={p.id} project={p} delay={i * 0.05} />
                    ))}
                </div>
            )}

        </div>
    );
}
