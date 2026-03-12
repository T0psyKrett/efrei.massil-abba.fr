"use client";

import {
    Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink,
} from "@react-pdf/renderer";
import { FileDown } from "lucide-react";
import { Report } from "@/services/firestoreService";

// Strip HTML tags for PDF plain text output
function stripHtml(html: string): string {
    return html
        .replace(/<\/p>/gi, "\n")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/li>/gi, "\n")
        .replace(/<li[^>]*>/gi, "• ")
        .replace(/<\/h[1-6]>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ")
        .trim();
}

const styles = StyleSheet.create({
    page: { fontFamily: "Helvetica", fontSize: 11, lineHeight: 1.7, color: "#1a2a3a", paddingTop: 60, paddingBottom: 60, paddingHorizontal: 65 },
    coverPage: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", paddingTop: 120, paddingBottom: 80, paddingHorizontal: 65 },
    accent: { width: 32, height: 3, backgroundColor: "#1a7fd4", marginBottom: 24 },
    coverTitle: { fontSize: 28, fontFamily: "Helvetica-Bold", color: "#0a1628", lineHeight: 1.3, marginBottom: 16 },
    coverMeta: { fontSize: 11, color: "#4a6080", lineHeight: 2 },
    coverInstitution: { fontSize: 13, fontFamily: "Helvetica-Bold", color: "#1a7fd4", marginTop: 40 },
    divider: { borderBottomWidth: 1, borderBottomColor: "#dde8f0", marginTop: 8, marginBottom: 40 },
    sectionNumber: { fontSize: 9, color: "#1a7fd4", fontFamily: "Helvetica-Bold", marginBottom: 4 },
    sectionTitle: { fontSize: 16, fontFamily: "Helvetica-Bold", color: "#0a1628", marginBottom: 12 },
    sectionDivider: { borderBottomWidth: 1, borderBottomColor: "#e8eef5", marginBottom: 14 },
    body: { fontSize: 11, color: "#334155", lineHeight: 1.8 },
    footer: { position: "absolute", bottom: 32, left: 65, right: 65, flexDirection: "row", justifyContent: "space-between", fontSize: 9, color: "#94a3b8" },
});

function ReportPDF({ report }: { report: Report }) {
    return (
        <Document title={report.title} author="Massil Abba" subject={report.course} creator="EFREI Academic Workspace">
            {/* Cover Page */}
            <Page size="A4" style={styles.coverPage}>
                <View style={styles.accent} />
                <Text style={styles.coverTitle}>{report.title}</Text>
                <View style={styles.divider} />
                <Text style={styles.coverMeta}>Course: {report.course}</Text>
                <Text style={styles.coverMeta}>Author: Massil Abba</Text>
                <Text style={styles.coverInstitution}>EFREI Paris</Text>
            </Page>

            {/* Content Pages */}
            {report.sections?.map((section, i) => {
                const text = stripHtml(section.content || "");
                if (!text) return null;
                return (
                    <Page key={section.id} size="A4" style={styles.page}>
                        <Text style={styles.sectionNumber}>SECTION {i + 1}</Text>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionDivider} />
                        <Text style={styles.body}>{text}</Text>
                        <View style={styles.footer} fixed>
                            <Text>{report.title}</Text>
                            <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
                        </View>
                    </Page>
                );
            })}
        </Document>
    );
}

interface PDFExportProps {
    report: Report;
}

export default function PDFExport({ report }: PDFExportProps) {
    const filename = `${report.title.replace(/\s+/g, "_")}.pdf`;

    return (
        <PDFDownloadLink document={<ReportPDF report={report} />} fileName={filename}>
            {({ loading }) => (
                <button
                    disabled={loading}
                    className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                    style={{ background: "#1a7fd4", color: "#ffffff" }}
                >
                    <FileDown size={16} />
                    {loading ? "Preparing PDF…" : "Export PDF"}
                </button>
            )}
        </PDFDownloadLink>
    );
}
