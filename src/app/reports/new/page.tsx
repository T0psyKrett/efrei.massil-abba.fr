"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { createReport } from "@/services/firestoreService";
import ReportEditor from "@/components/report/ReportEditor";

function NewReportContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId") ?? "";

    const handleSave = async (data: Parameters<typeof createReport>[0]) => {
        const id = await createReport(data);
        router.push(`/reports/${id}`);
    };

    return <ReportEditor projectId={projectId} onSave={handleSave} />;
}

export default function NewReportPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 28px" }}>
                <div className="rounded-xl animate-pulse" style={{ height: 40, width: 200, background: "var(--bg-card)", marginBottom: 16 }} />
                <div className="rounded-2xl animate-pulse" style={{ height: 200, background: "var(--bg-card)" }} />
            </div>
        }>
            <NewReportContent />
        </Suspense>
    );
}
