"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, FileText, Upload, Edit2, Plus, ExternalLink, FolderOpen, Layers, Eye, EyeOff } from "lucide-react";
import TagBadge from "@/components/ui/TagBadge";
import FileImport from "@/components/report/FileImport";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { getProject, getProjectReports, Project, Report, updateProject } from "@/services/firestoreService";
import { useAuth } from "@/contexts/AuthContext";

export default function ProjectDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [project, setProject] = useState<Project | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImport, setShowImport] = useState(false);
    const [isPublished, setIsPublished] = useState(true);
    const [isToggling, setIsToggling] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const loadData = async () => {
        try {
            const [p, r] = await Promise.all([getProject(id), getProjectReports(id)]);
            setProject(p); setReports(r);
            if (p) setIsPublished(p.published !== false);
        } catch { setProject(null); setReports([]); }
        setLoading(false);
    };

    const handleTogglePublish = async () => {
        if (!project || isToggling) return;
        setIsToggling(true);
        try {
            const newState = !isPublished;
            await updateProject(id, { published: newState, status: newState ? "published" : "hidden" });
            setIsPublished(newState);
        } catch (error) {
            console.error(error);
        } finally {
            setIsToggling(false);
        }
    };

    useEffect(() => { loadData(); }, [id, loadData]);

    if (loading) return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
            <div className="h-8 w-48 rounded-xl animate-pulse" style={{ background: "var(--bg-card)", marginBottom: 16 }} />
            <div className="rounded-2xl animate-pulse" style={{ height: 320, background: "var(--bg-card)" }} />
        </div>
    );

    if (!project) return (
        <div className="text-center" style={{ padding: "80px 28px", color: "var(--text-muted)" }}>Project not found.</div>
    );

    const generatedReports = reports.filter((r) => r.type === "generated");
    const importedReports = reports.filter((r) => r.type === "imported");

    return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
            {/* Back */}
            <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] font-medium transition-colors"
                style={{ color: "var(--text-muted)", marginBottom: 24 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#60b8ff")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
                <ArrowLeft size={15} /> Back
            </button>

            {/* Header card */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ maxWidth: 900, padding: 32, marginBottom: 28 }}
            >
                <div className="flex items-start justify-between gap-4 flex-wrap" style={{ marginBottom: 16 }}>
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(26,127,212,0.1)", border: "1px solid rgba(26,127,212,0.15)" }}>
                            <FolderOpen size={20} style={{ color: "#3498ee" }} />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>{project.title}</h1>
                                {isAdmin && (
                                    <button
                                        onClick={handleTogglePublish}
                                        disabled={isToggling}
                                        className={`relative flex items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                                        style={{
                                            width: 60,
                                            height: 32,
                                            background: isPublished ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
                                            border: `1px solid ${isPublished ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)"}`,
                                        }}
                                        title={isPublished ? "Unpublish project" : "Publish project"}
                                    >
                                        <motion.div
                                            className="absolute rounded-full"
                                            style={{
                                                width: 26,
                                                height: 26,
                                                top: 2,
                                                background: isPublished ? "#22c55e" : "#ef4444",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }}
                                            initial={false}
                                            animate={{ left: isPublished ? 30 : 2 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                        <div className="relative z-10 flex items-center w-full justify-between px-[7px] pointer-events-none">
                                            <Eye size={13} style={{ color: isPublished ? "#fff" : "rgba(239,68,68,0.8)", transition: "color 0.2s" }} />
                                            <EyeOff size={13} style={{ color: !isPublished ? "#fff" : "rgba(34,197,94,0.8)", transition: "color 0.2s" }} />
                                        </div>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-[12px]" style={{ color: "var(--text-muted)", marginTop: 2 }}>
                                <span>{project.course}</span>
                            </div>
                        </div>
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-all"
                                style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}>
                                Delete Project
                            </button>
                            <Link href={`/projects/${id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium transition-all"
                                style={{ background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-color-strong)")}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}>
                                <Edit2 size={13} /> Edit
                            </Link>
                        </div>
                    )}
                </div>
                {project.description && (
                    <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-secondary)", marginBottom: 16 }}>
                        {project.description}
                    </p>
                )}
                {(project.tags?.length > 0 || project.technologies?.length > 0) && (
                    <div className="flex flex-wrap" style={{ gap: 8 }}>
                        {project.tags?.map((t) => <TagBadge key={t} label={t} variant="default" />)}
                        {project.technologies?.map((t) => <TagBadge key={t} label={t} variant="tech" />)}
                    </div>
                )}
            </motion.div>

            {/* Generated reports section */}
            <div style={{ maxWidth: 900, marginBottom: 28 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                    <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>Generated Reports</h2>
                    {isAdmin && (
                        <Link href={`/reports/new?projectId=${id}`}
                            className="flex items-center gap-1.5 text-[11px] font-semibold rounded-lg transition-all"
                            style={{ padding: "8px 14px", background: "rgba(26,127,212,0.1)", color: "#60b8ff", border: "1px solid rgba(26,127,212,0.15)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(26,127,212,0.3)")}
                            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(26,127,212,0.15)")}>
                            <Plus size={12} /> New Report
                        </Link>
                    )}
                </div>
                {generatedReports.length === 0 ? (
                    <div className="glass-card text-center" style={{ padding: "32px 24px" }}>
                        <Layers size={20} style={{ color: "var(--text-muted)", marginBottom: 8 }} className="mx-auto" />
                        <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>No generated reports yet.</p>
                    </div>
                ) : (
                    <div className="flex flex-col" style={{ gap: 8 }}>
                        {generatedReports.map((r) => (
                            <Link key={r.id} href={`/reports/${r.id}`}
                                className="glass-card flex items-center gap-3"
                                style={{ padding: "16px 20px" }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(26,127,212,0.1)" }}>
                                    <FileText size={14} style={{ color: "#60b8ff" }} />
                                </div>
                                <span className="text-[13px] font-medium flex-1" style={{ color: "var(--text-primary)" }}>{r.title}</span>
                                <ExternalLink size={13} style={{ color: "var(--text-muted)" }} />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Imported documents section */}
            <div style={{ maxWidth: 900 }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                    <h2 className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
                        Imported Documents
                        {importedReports.length > 0 && (
                            <span className="ml-2 text-[10px] rounded-full font-medium"
                                style={{ padding: "3px 10px", background: "rgba(99,102,241,0.1)", color: "#a5b4fc" }}>
                                {importedReports.length}
                            </span>
                        )}
                    </h2>
                </div>

                {isAdmin && (
                    <div style={{ marginBottom: 16 }}>
                        <FileImport projectId={id} onImported={() => loadData()} />
                    </div>
                )}

                {importedReports.length > 0 && (
                    <div className="flex flex-col" style={{ gap: 8 }}>
                        {importedReports.map((r) => (
                            <div key={r.id} className="glass-card flex items-center gap-3" style={{ padding: "16px 20px" }}>
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: "rgba(99,102,241,0.1)" }}>
                                    <FileText size={14} style={{ color: "#a5b4fc" }} />
                                </div>
                                <span className="text-[13px] font-medium flex-1" style={{ color: "var(--text-primary)" }}>{r.title}</span>
                                <span className="text-[10px] rounded-full font-medium"
                                    style={{ padding: "4px 10px", background: "rgba(99,102,241,0.08)", color: "#a5b4fc" }}>
                                    {r.importedFileType?.toUpperCase()}
                                </span>
                                {r.importedFileUrl && (
                                    <a href={r.importedFileUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                                        <ExternalLink size={13} style={{ color: "var(--text-muted)" }} />
                                    </a>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* PDF Export Button Fixed Global */}
            <ConfirmModal 
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={async () => {
                    try {
                        const { deleteProjectWithReports } = await import("@/services/firestoreService");
                        await deleteProjectWithReports(id);
                        router.push("/projects");
                    } catch (error) {
                        console.error(error);
                    }
                }}
                title="Delete Project?"
                message={`Are you sure you want to delete "${project.title}"? This action is permanent and will remove all associated reports and documents.`}
                confirmText="Delete Project"
                variant="danger"
            />
        </div>
    );
}
