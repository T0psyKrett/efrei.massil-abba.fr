"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Edit2, Eye, FileText, Download, Trash2 } from "lucide-react";
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
        <div className="min-h-screen py-6 px-4 sm:px-8 max-w-7xl mx-auto">
            {/* ─── Top Header Banner ─── */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 sm:p-6 rounded-2xl mb-6 border shadow-lg transition-all"
                style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border-color)",
                }}
            >
                {/* Breadcrumb & Navigation */}
                <div className="flex items-center gap-3 text-xs mb-4 text-[var(--text-muted)] flex-wrap">
                    <button
                        onClick={() => router.back()}
                        aria-label="Retour aux rapports"
                        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold text-[#3b9fd4] bg-[#3b9fd4]/10 hover:bg-[#3b9fd4]/20 border border-[#3b9fd4]/25 hover:border-[#3b9fd4]/50 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(59,159,212,0.25)] cursor-pointer active:scale-95"
                    >
                        <div className="w-5 h-5 rounded-full bg-[#3b9fd4]/20 flex items-center justify-center group-hover:bg-[#3b9fd4] group-hover:text-white transition-all">
                            <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
                        </div>
                        <span>Retour aux rapports</span>
                    </button>

                    <span className="opacity-30 text-sm">/</span>

                    <span className="font-medium truncate max-w-[200px] sm:max-w-[350px] text-[var(--text-muted)]">
                        {report.title}
                    </span>
                </div>

                {/* Main Title & Action Buttons Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Title & Meta Badges */}
                    <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1
                                className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] leading-tight"
                                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                            >
                                {report.title}
                            </h1>
                            {report.course && (
                                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#3b9fd4]/15 border border-[#3b9fd4]/30 text-[#3b9fd4]">
                                    {report.course}
                                </span>
                            )}
                        </div>

                        {report.subtitle && (
                            <p className="text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2">
                                {report.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0 self-start md:self-auto pt-2 md:pt-0 border-t md:border-t-0 border-[var(--border-color)] w-full md:w-auto">
                        {pdfUrl && (
                            <>
                                <a
                                    href={pdfUrl}
                                    download={`${report.title.replace(/[^a-z0-9_-]/gi, "_")}.pdf`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all text-[var(--text-primary)] hover:bg-[#3b9fd4]/10 border border-[var(--border-color)] hover:border-[#3b9fd4]/40"
                                >
                                    <Download size={14} className="text-[#3b9fd4]" />
                                    <span>Télécharger</span>
                                </a>

                                <button
                                    onClick={() => setPdfOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-md cursor-pointer hover:opacity-90 active:scale-[0.98]"
                                    style={{
                                        background: "linear-gradient(135deg, #1B6CA8, #3b9fd4)",
                                    }}
                                >
                                    <Eye size={14} />
                                    <span>Plein Écran</span>
                                </button>
                            </>
                        )}

                        {isAdmin && (
                            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border-color)]">
                                <Link
                                    href={`/reports/${id}/edit`}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[var(--text-primary)] hover:bg-[#3b9fd4]/10 border border-[var(--border-color)] hover:border-[#3b9fd4]/40"
                                >
                                    <Edit2 size={13} className="text-[#3b9fd4]" />
                                    <span>Éditer</span>
                                </Link>

                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-500 hover:text-red-400 hover:bg-red-500/10 border border-red-500/20 cursor-pointer"
                                >
                                    <Trash2 size={13} />
                                    <span>Supprimer</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ─── Direct PDF Viewer ─── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                {pdfUrl ? (
                    <div className="h-[82vh] min-h-[620px] w-full rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-2xl bg-[var(--bg-card)]">
                        <PDFViewer url={pdfUrl} title={report.title} className="h-full w-full" />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-[var(--text-muted)] bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)]">
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
