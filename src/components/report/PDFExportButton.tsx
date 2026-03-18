"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Report, SiteSettings } from "@/services/firestoreService";
import { Printer, Loader2 } from "lucide-react";

// Dynamically import PDF components to reduce bundle size
const PDFDownloadLink = dynamic(
    () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
    { ssr: false, loading: () => <Loader2 className="animate-spin" size={18} /> }
);

import { ReportDocument } from "./PDFDocument";

export default function PDFExportButton({ report, settings }: { report: Report, settings?: SiteSettings }) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient || !report) return null;

    return (
        <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] print:hidden">
            <PDFDownloadLink
                document={<ReportDocument report={report} settings={settings} />}
                fileName={`${report.title.replace(/\s+/g, "_")}.pdf`}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-white font-bold text-[13px] transition-all hover:scale-[1.03] active:scale-[0.98] shadow-2xl group"
                style={{
                    background: "linear-gradient(135deg, #2563EB, #1D4ED8)",
                    boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)"
                }}
            >
                {({ loading }) => (
                    <>
                        {loading ? (
                            <Loader2 className="animate-spin" size={17} />
                        ) : (
                            <Printer size={17} className="transition-transform group-hover:-translate-y-0.5" />
                        )}
                        <span>{loading ? "Génération du PDF..." : "Exporter en PDF"}</span>
                        {!loading && (
                            <div className="absolute inset-0 rounded-2xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                    </>
                )}
            </PDFDownloadLink>
        </div>
    );
}
