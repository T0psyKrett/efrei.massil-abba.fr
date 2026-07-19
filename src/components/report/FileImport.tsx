"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X, ChevronRight, Settings } from "lucide-react";
import { uploadFile, generateStoragePath, detectFileType } from "@/services/storageService";
import { createReport, getSettings, SiteSettings } from "@/services/firestoreService";
import { useRouter } from "next/navigation";
import PDFPreviewModal from "@/components/ui/PDFPreviewModal";

interface FileImportProps {
    projectId: string;
    onImported?: () => void;
}

interface ImportedFile {
    name: string;
    type: "pdf" | "docx" | "md" | null;
    status: "uploading" | "done" | "error";
    url?: string;
    htmlContent?: string;
    mdContent?: string;
    progress: number;
    errorMsg?: string;
    reportId?: string;
}

export default function FileImport({ projectId, onImported }: FileImportProps) {
    const router = useRouter();
    const [files, setFiles] = useState<ImportedFile[]>([]);
    const [viewingFile, setViewingFile] = useState<ImportedFile | null>(null);
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<string>("");

    useEffect(() => {
        getSettings().then(setSettings).catch(console.error);
    }, []);

    const processFile = async (file: File) => {
        const allowedTypes = [".pdf", ".docx", ".md", ".png", ".jpg", ".jpeg"];
        const fileType = detectFileType(file.name);
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        
        if (!allowedTypes.includes(extension)) {
            const entry: ImportedFile = { name: file.name, type: null, status: "error", progress: 0, errorMsg: `File type ${extension} not allowed` };
            setFiles((prev) => [...prev, entry]);
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            const entry: ImportedFile = { name: file.name, type: fileType, status: "error", progress: 0, errorMsg: "Fichier trop volumineux (Max 50 Mo)" };
            setFiles((prev) => [...prev, entry]);
            return;
        }

        const entry: ImportedFile = { name: file.name, type: fileType, status: "uploading", progress: 0 };
        setFiles((prev) => [...prev, entry]);

        try {
            let htmlContent: string | undefined;
            let mdContent: string | undefined;

            if (fileType === "docx") {
                const mammoth = (await import("mammoth")).default;
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.convertToHtml({ arrayBuffer });
                htmlContent = result.value;
            }

            if (fileType === "md") {
                mdContent = await file.text();
            }

            // Always upload to storage for backup/reference, even if we extract text
            const path = generateStoragePath(projectId, file.name, "imports");
            const url = await uploadFile(file, path, (progress) => {
                setFiles((prev) =>
                    prev.map((f) => (f.name === file.name ? { ...f, progress } : f))
                );
            });

            const isTextDoc = fileType === "docx" || fileType === "md";
            const reportType = isTextDoc ? "generated" : "imported";
            
            let finalHtml = htmlContent || "";
            if (fileType === "md" && mdContent) {
                // simple escaping and br
                finalHtml = mdContent.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
            }

            const initialSections = isTextDoc ? [
                {
                    id: `section-import-${Date.now()}`,
                    title: "Imported Content",
                    icon: "FileText",
                    placeholder: "",
                    content: finalHtml,
                    blocks: [
                        {
                            id: `block-import-${Date.now()}`,
                            type: "text" as const,
                            content: finalHtml
                        }
                    ]
                }
            ] : [];

            const reportId = await createReport({
                projectId,
                title: file.name.replace(/\.(pdf|docx|md)$/i, ""),
                course: selectedCourse,
                sections: initialSections,
                type: reportType,
                importedFileUrl: isTextDoc ? undefined : url,
                importedFileType: isTextDoc ? undefined : (fileType ?? undefined),
                published: true // Publish immediately for visitors
            });

            setFiles((prev) =>
                prev.map((f) =>
                    f.name === file.name
                        ? { ...f, status: "done", url, htmlContent, mdContent, progress: 100, reportId }
                        : f
                )
            );
            onImported?.();
        } catch (err: any) {
            console.error("Upload error details:", err);
            const msg = err?.message || "Échec de l'envoi du fichier. Réessayez.";
            setFiles((prev) =>
                prev.map((f) => (f.name === file.name ? { ...f, status: "error", errorMsg: msg } : f))
            );
        }
    };

    const onDrop = useCallback(
        (accepted: File[]) => accepted.forEach(processFile),
        [projectId, selectedCourse]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/markdown": [".md"] },
        multiple: true,
    });

    return (
        <div className="space-y-4">
            {/* Context bar */}
            <div className="flex items-center gap-3 mb-2">
                <Settings size={16} style={{ color: "var(--text-muted)" }} />
                <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="bg-[var(--input-bg)] border border-[var(--border-color)] rounded-lg text-[13px] text-[var(--text-primary)] outline-none px-3 py-2 transition-colors focus:border-[#00ff88]"
                    style={{ minWidth: 200 }}
                >
                    <option value="">Assign Course (Optional)</option>
                    {settings?.courses.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
            </div>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all text-center"
                style={{
                    border: `2px dashed ${isDragActive ? "#00ff88" : "var(--border-dashed)"}`,
                    background: isDragActive ? "rgba(0,255,136,0.08)" : "var(--bg-card)",
                    minHeight: 140,
                }}
            >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors"
                    style={{ background: isDragActive ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.03)" }}>
                    <Upload size={24} style={{ color: isDragActive ? "#00ff88" : "var(--text-muted)" }} />
                </div>
                <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {isDragActive ? "Drop files here" : "Drag & drop files to import"}
                    </p>
                    <p className="text-[11px] mt-1.5" style={{ color: "var(--text-muted)" }}>
                        DOCX and MD files are automatically converted to editable sections!
                    </p>
                </div>
                <button
                    type="button"
                    className="px-5 py-2 mt-2 rounded-lg text-[12px] font-bold transition-all"
                    style={{ background: "rgba(0,255,136,0.1)", color: "#00ff88" }}
                >
                    Browse files
                </button>
            </div>

            {/* File list */}
            <AnimatePresence>
                {files.map((f, idx) => (
                    <motion.div
                        key={f.name + idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 rounded-xl flex items-center gap-3"
                        style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)" }}
                    >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(14,165,233,0.1)" }}>
                            <FileText size={18} style={{ color: "#0ea5e9" }} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                    {f.name}
                                </p>
                                {f.status === "done" && (
                                    <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                                        style={{ background: "rgba(0,255,136,0.15)", color: "#00ff88" }}>
                                        Imported
                                    </span>
                                )}
                            </div>
                            
                            {f.status === "uploading" && (
                                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{ width: `${f.progress}%`, background: "linear-gradient(90deg, #00ff88, #0ea5e9)" }}
                                    />
                                </div>
                            )}
                            {f.status === "error" && (
                                <p className="text-xs font-medium" style={{ color: "#f87171" }}>{f.errorMsg}</p>
                            )}
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                            {f.status === "uploading" && <Loader2 size={16} className="animate-spin" style={{ color: "#00ff88" }} />}
                            {f.status === "done" && (
                                <>
                                    {f.type === "pdf" ? (
                                        <button
                                            onClick={() => setViewingFile(f)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-opacity-80"
                                            style={{ background: "rgba(14,165,233,0.1)", color: "#0ea5e9" }}
                                        >
                                            Preview PDF
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => router.push(`/reports/${f.reportId}`)}
                                            className="px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                                            style={{ background: "rgba(0,255,136,0.15)", color: "#00ff88" }}
                                        >
                                            Edit Report <ChevronRight size={14} />
                                        </button>
                                    )}
                                    <CheckCircle2 size={20} style={{ color: "#00ff88" }} />
                                </>
                            )}
                            {f.status === "error" && <AlertCircle size={20} style={{ color: "#f87171" }} />}
                            <button
                                onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))}
                                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Inline document viewer modal */}
            <PDFPreviewModal
                open={!!viewingFile}
                onClose={() => setViewingFile(null)}
                pdfUrl={viewingFile?.url}
                title={viewingFile?.name}
            />
        </div>
    );
}
