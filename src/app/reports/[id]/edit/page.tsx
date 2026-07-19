"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getReport, Report } from "@/services/firestoreService";
import PDFReportEditor from "@/components/report/PDFReportEditor";

export default function EditReportPage() {
    const { id } = useParams<{ id: string }>();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReport(id)
            .then((r) => { setReport(r); setLoading(false); })
            .catch(() => { setReport(null); setLoading(false); });
    }, [id]);

    if (loading) return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 28px" }}>
            <div className="rounded-xl animate-pulse" style={{ height: 40, width: 200, background: "var(--bg-card)", marginBottom: 16 }} />
            <div className="rounded-2xl animate-pulse" style={{ height: 300, background: "var(--bg-card)" }} />
        </div>
    );

    if (!report) return (
        <div className="text-center" style={{ padding: "80px 28px", color: "var(--text-muted)" }}>
            Rapport non trouvé.
        </div>
    );

    return <PDFReportEditor report={report} />;
}
