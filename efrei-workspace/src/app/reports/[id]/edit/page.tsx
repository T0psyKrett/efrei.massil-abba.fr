"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getReport, updateReport, Report } from "@/services/firestoreService";
import ReportEditor from "@/components/report/ReportEditor";

export default function EditReportPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [report, setReport] = useState<Report | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getReport(id)
            .then((r) => { setReport(r); setLoading(false); })
            .catch(() => { setReport(null); setLoading(false); });
    }, [id]);

    const handleSave = async (data: Omit<Report, "id" | "createdAt" | "updatedAt">) => {
        await updateReport(id, data);
    };

    if (loading) return (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
            <div className="rounded-xl animate-pulse" style={{ height: 40, width: 200, background: "var(--bg-card)", marginBottom: 16 }} />
            <div className="rounded-2xl animate-pulse" style={{ height: 200, background: "var(--bg-card)" }} />
        </div>
    );

    if (!report) return (
        <div className="text-center" style={{ padding: "80px 28px", color: "var(--text-muted)" }}>Report not found.</div>
    );

    return <ReportEditor report={report} projectId={report.projectId} onSave={handleSave} />;
}
