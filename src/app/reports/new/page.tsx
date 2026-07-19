"use client";
export const dynamic = 'force-dynamic';

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import FileImport from "@/components/report/FileImport";
import { ArrowLeft, FileText } from "lucide-react";

function NewReportContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const projectId = searchParams.get("projectId") ?? "";

    return (
        <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-[13px] font-medium mb-6 transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
            >
                <ArrowLeft size={15} /> Retour aux rapports
            </button>

            {/* Title Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    Ajouter un Rapport PDF
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                    Sélectionnez ou glissez-déposez votre rapport PDF finalisé.
                </p>
            </div>

            {/* Import Component Container */}
            <div className="glass-card p-6 sm:p-8 rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#1B6CA8]/15 border border-[#1B6CA8]/30 flex items-center justify-center text-[#3b9fd4]">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[var(--text-primary)]">
                            Importateur de Rapport PDF
                        </h2>
                        <p className="text-xs text-[var(--text-muted)]">
                            Votre fichier sera instantanément stocké et rendu disponible dans la visionneuse PDF HD.
                        </p>
                    </div>
                </div>

                <FileImport projectId={projectId} onImported={() => router.push("/reports")} />
            </div>
        </div>
    );
}

export default function NewReportPage() {
    return (
        <Suspense fallback={
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 28px" }}>
                <div className="rounded-xl animate-pulse" style={{ height: 40, width: 200, background: "var(--bg-card)", marginBottom: 16 }} />
                <div className="rounded-2xl animate-pulse" style={{ height: 260, background: "var(--bg-card)" }} />
            </div>
        }>
            <NewReportContent />
        </Suspense>
    );
}
