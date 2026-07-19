"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Edit2, Eye, FileText } from "lucide-react";
import { getReport, Report } from "@/services/firestoreService";
import nextDynamic from "next/dynamic";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PDFPreviewModal from "@/components/ui/PDFPreviewModal";
import { useAuth } from "@/contexts/AuthContext";

const PDFViewer = nextDynamic(() => import("@/components/ui/PDFViewer"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-[500px] bg-[#0D1B2A] text-[#3b9fd4] text-xs">
            Chargement de la visionneuse…
        </div>
    ),
});

export default function ReportPage() {
    const { id }   = useParams<{ id: string }>();
    const router   = useRouter();
    const { isAdmin } = useAuth();

    const [report, setReport]                   = useState<Report | null>(null);
    const [loading, setLoading]                 = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [pdfOpen, setPdfOpen]                 = useState(false);

    useEffect(() => {
        getReport(id)
            .then((r) => {
                setReport(r);
                setLoading(false);
            })
            .catch(() => { setReport(null); setLoading(false); });
    }, [id]);

    if (loading) return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
            <div className="rounded-xl animate-pulse"
                style={{ height: 40, width: 200, background: "var(--bg-card)", marginBottom: 16 }} />
            <div className="rounded-2xl animate-pulse"
                style={{ height: 320, background: "var(--bg-card)" }} />
        </div>
    );

    if (!report) return (
        <div className="text-center" style={{ padding: "80px 28px", color: "var(--text-muted)" }}>
            Rapport non trouvé.
        </div>
    );

    const pdfUrl = report.importedFileUrl;

    return (
        <div>
            {/* ─── Sticky action bar ─── */}
            <div
                className="sticky top-16 z-40 flex items-center justify-between flex-wrap gap-3"
                style={{
                    padding: "10px 28px",
                    background: "rgba(13,27,42,0.88)",
                    backdropFilter: "blur(20px) saturate(1.4)",
                    borderBottom: "1px solid rgba(27,108,168,0.14)",
                }}
            >
                {/* Breadcrumb back */}
                <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
                    <button
                        onClick={() => router.back()}
                        aria-label="Retour aux rapports"
                        className="flex items-center gap-1.5 font-medium transition-colors hover:text-[#3b9fd4] cursor-pointer"
                        style={{ color: "var(--text-muted)" }}
                    >
                        <ArrowLeft size={14} aria-hidden="true" /> Rapports
                    </button>
                    <span style={{ opacity: 0.35 }}>/</span>
                    <span
                        className="font-semibold truncate max-w-[240px] sm:max-w-[320px]"
                        style={{ color: "var(--text-primary)" }}
                        aria-current="page"
                    >
                        {report.title}
                    </span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                    {pdfUrl && (
                        <button
                            onClick={() => setPdfOpen(true)}
                            aria-label="Aperçu modal PDF"
                            className="flex items-center gap-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer"
                            style={{
                                padding: "7px 14px",
                                background: "rgba(27,108,168,0.10)",
                                color: "#3b9fd4",
                                border: "1px solid rgba(27,108,168,0.25)",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(27,108,168,0.18)")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(27,108,168,0.10)")}
                        >
                            <Eye size={13} aria-hidden="true" /> Plein écran / Modal
                        </button>
                    )}

                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                aria-label="Supprimer le rapport"
                                className="flex items-center gap-2 rounded-xl text-[12px] font-medium transition-all cursor-pointer"
                                style={{
                                    padding: "7px 14px",
                                    background: "rgba(239,68,68,0.1)",
                                    color: "#f87171",
                                    border: "1px solid rgba(239,68,68,0.2)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}
                            >
                                Supprimer
                            </button>
                            <Link
                                href={`/reports/${id}/edit`}
                                aria-label="Éditer ce rapport"
                                className="flex items-center gap-2 rounded-xl text-[12px] font-medium transition-all"
                                style={{
                                    padding: "7px 14px",
                                    background: "var(--bg-card)",
                                    color: "var(--text-secondary)",
                                    border: "1px solid var(--border-color)",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(27,108,168,0.4)")}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}
                            >
                                <Edit2 size={13} aria-hidden="true" /> Éditer
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ─── Direct PDF Viewer ─── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4 px-4 sm:px-8 max-w-6xl mx-auto">
                {pdfUrl ? (
                    <div className="h-[85vh] min-h-[640px] w-full rounded-2xl overflow-hidden border border-[#1a3049] my-4 shadow-2xl">
                        <PDFViewer url={pdfUrl} title={report.title} className="h-full w-full" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-[#5c7d99]">
                        <FileText size={32} className="mb-2 text-[#3b9fd4]" />
                        <p className="text-sm">Aucun fichier PDF associé à ce rapport.</p>
                    </div>
                )}
            </motion.div>

            {/* Delete confirmation */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={async () => {
                    try {
                        const { deleteReport } = await import("@/services/firestoreService");
                        await deleteReport(id);
                        router.push("/reports");
                    } catch (error) {
                        console.error(error);
                    }
                }}
                title="Supprimer le rapport ?"
                message={`Êtes-vous sûr de vouloir supprimer "${report.title}" ? Cette action est irréversible.`}
                confirmText="Supprimer définitivement"
                variant="danger"
            />

            {/* PDF Preview modal */}
            {pdfUrl && (
                <PDFPreviewModal
                    open={pdfOpen}
                    onClose={() => setPdfOpen(false)}
                    pdfUrl={pdfUrl}
                    title={report.title}
                />
            )}
        </div>
    );
}
