"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, CheckCircle2, FileText, Upload } from "lucide-react";
import { Report, updateReport } from "@/services/firestoreService";
import FileImport from "./FileImport";

interface PDFReportEditorProps {
    report: Report;
}

export default function PDFReportEditor({ report }: PDFReportEditorProps) {
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showReupload, setShowReupload] = useState(false);

    const [form, setForm] = useState({
        title: report.title || "",
        course: report.course || "",
        subtitle: report.subtitle || "",
        domain: report.domain || "pentest",
        groupMembers: report.groupMembers ? report.groupMembers.join(", ") : "Massil ABBA",
        tutor: report.tutor || "",
        dateOverride: report.dateOverride || "",
        published: report.published !== false,
        importedFileUrl: report.importedFileUrl || "",
    });

    const handleSave = async () => {
        if (!report.id) return;
        setSaving(true);
        try {
            await updateReport(report.id, {
                title: form.title,
                course: form.course,
                subtitle: form.subtitle,
                domain: form.domain,
                groupMembers: form.groupMembers.split(",").map(s => s.trim()).filter(Boolean),
                tutor: form.tutor,
                dateOverride: form.dateOverride,
                published: form.published,
                importedFileUrl: form.importedFileUrl,
                type: "imported",
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
            router.push(`/reports/${report.id}`);
        } catch (err) {
            console.error("Failed to update report", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="py-8 max-w-4xl mx-auto px-4 sm:px-6">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-[13px] font-medium mb-6 transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
                <ArrowLeft size={15} /> Back to Report
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    Éditer le Rapport PDF
                </h1>
                <p className="text-xs text-[var(--text-muted)]">
                    Modifiez les informations du rapport ou remplacez le fichier PDF.
                </p>
            </div>

            {/* Current PDF file indicator & replace option */}
            <div className="glass-card p-5 mb-6 rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1B6CA8]/15 border border-[#1B6CA8]/30 flex items-center justify-center text-[#3b9fd4]">
                            <FileText size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[var(--text-primary)]">Fichier PDF Actuel</p>
                            <p className="text-[11px] text-[var(--text-muted)] truncate max-w-xs sm:max-w-md">
                                {form.importedFileUrl || "Aucun PDF lié"}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowReupload(!showReupload)}
                        className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
                    >
                        <Upload size={14} /> {showReupload ? "Masquer l'importateur" : "Remplacer le PDF"}
                    </button>
                </div>

                {showReupload && (
                    <div className="mt-5 pt-5 border-t border-[var(--border-color)]">
                        <FileImport
                            projectId={report.projectId}
                            onImported={() => {
                                setShowReupload(false);
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Metadata Edit Form */}
            <div className="glass-card p-6 rounded-2xl border border-[var(--border-color)] space-y-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#3b9fd4] mb-4">
                    Informations & Fiche du Rapport
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Titre du Rapport *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#3B82F6]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Matière / Cours</label>
                        <input
                            type="text"
                            value={form.course}
                            onChange={(e) => setForm(f => ({ ...f, course: e.target.value }))}
                            placeholder="ex: Pentest, Reseau, Security Audit..."
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#3B82F6]"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Sous-titre / Description</label>
                    <input
                        type="text"
                        value={form.subtitle}
                        onChange={(e) => setForm(f => ({ ...f, subtitle: e.target.value }))}
                        placeholder="Brève description du contenu..."
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#3B82F6]"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Domaine</label>
                        <input
                            type="text"
                            value={form.domain}
                            onChange={(e) => setForm(f => ({ ...f, domain: e.target.value }))}
                            placeholder="pentest, network, linux..."
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#3B82F6]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Membres du Groupe</label>
                        <input
                            type="text"
                            value={form.groupMembers}
                            onChange={(e) => setForm(f => ({ ...f, groupMembers: e.target.value }))}
                            placeholder="Massil ABBA, ..."
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#3B82F6]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">Date personnalisée</label>
                        <input
                            type="text"
                            value={form.dateOverride}
                            onChange={(e) => setForm(f => ({ ...f, dateOverride: e.target.value }))}
                            placeholder="ex: 19 juil. 2026"
                            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-3 py-2 text-xs text-[var(--text-primary)] outline-none focus:border-[#3B82F6]"
                        />
                    </div>
                </div>

                {/* Published toggle */}
                <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-[var(--text-primary)]">Visibilité du Rapport</p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                            {form.published ? "Publié — Visible par tous les visiteurs" : "Masqué — Visible par vous uniquement (Admin)"}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={form.published}
                            onChange={(e) => setForm(f => ({ ...f, published: e.target.checked }))}
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B6CA8]"></div>
                    </label>
                </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving || !form.title}
                    className="btn-primary flex items-center gap-2 px-8 py-3 text-xs font-bold shadow-xl disabled:opacity-40 cursor-pointer"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckCircle2 size={16} /> : <Save size={16} />}
                    {saving ? "Enregistrement..." : saved ? "Enregistré avec succès !" : "Enregistrer les modifications"}
                </button>
            </div>
        </div>
    );
}
