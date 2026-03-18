"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Edit2, FileText } from "lucide-react";
import { getReport, Report } from "@/services/firestoreService";
import ReportViewer from "@/components/report/ReportViewer";
import PDFExport from "@/components/report/PDFExport";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useAuth } from "@/contexts/AuthContext";

export default function ReportPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { isAdmin } = useAuth();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        getReport(id)
            .then((r) => { setReport(r); setLoading(false); })
            .catch(() => { setReport(null); setLoading(false); });
    }, [id]);

    if (loading) return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
            <div className="rounded-xl animate-pulse" style={{ height: 40, width: 200, background: "var(--bg-card)", marginBottom: 16 }} />
            <div className="rounded-2xl animate-pulse" style={{ height: 320, background: "var(--bg-card)" }} />
        </div>
    );

    if (!report) return (
        <div className="text-center" style={{ padding: "80px 28px", color: "var(--text-muted)" }}>Report not found.</div>
    );

    return (
        <div>
            {/* ─── Sticky action bar ─── */}
            <div
                className="sticky top-16 z-40 flex items-center justify-between"
                style={{
                    padding: "12px 28px",
                    background: "rgba(8,16,32,0.82)",
                    backdropFilter: "blur(20px) saturate(1.4)",
                    borderBottom: "1px solid rgba(26,127,212,0.12)",
                    gap: 16,
                }}
            >
                <button onClick={() => router.back()} className="flex items-center gap-2 text-[13px] font-medium transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#60b8ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
                    <ArrowLeft size={15} /> Back
                </button>
                <div className="flex items-center" style={{ gap: 12 }}>
                    {isAdmin && (
                        <>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="flex items-center gap-2 rounded-xl text-[12px] font-medium transition-all"
                                style={{ padding: "8px 16px", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.15)")}
                                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.1)")}>
                                Delete Report
                            </button>
                            <Link href={`/reports/${id}/edit`}
                                className="flex items-center gap-2 rounded-xl text-[12px] font-medium transition-all"
                                style={{ padding: "8px 16px", background: "var(--bg-card)", color: "var(--text-secondary)", border: "1px solid var(--border-color)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-color-strong)")}
                                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-color)")}>
                                <Edit2 size={13} /> Edit
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {/* ─── Report content ─── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <ReportViewer report={report} />
            </motion.div>

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
                title="Delete Report?"
                message={`Are you sure you want to delete "${report.title}"? This action is permanent and cannot be undone.`}
                confirmText="Delete Report"
                variant="danger"
            />
        </div>
    );
}
