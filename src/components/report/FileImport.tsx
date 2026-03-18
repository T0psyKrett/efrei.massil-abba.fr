"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, File, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { uploadFile, generateStoragePath, detectFileType } from "@/services/storageService";
import { createReport } from "@/services/firestoreService";

interface FileImportProps {
    projectId: string;
    onImported?: () => void;
}

interface ImportedFile {
    name: string;
    type: "pdf" | "docx" | "md" | null;
    status: "uploading" | "done" | "error";
    url?: string;
    htmlContent?: string; // mammoth.js converted content
    mdContent?: string;   // raw markdown
    progress: number;
}

export default function FileImport({ projectId, onImported }: FileImportProps) {
    const [files, setFiles] = useState<ImportedFile[]>([]);
    const [viewingFile, setViewingFile] = useState<ImportedFile | null>(null);

    const processFile = async (file: File) => {
        // Validation
        const allowedTypes = [".pdf", ".docx", ".md", ".png", ".jpg", ".jpeg"];
        const fileType = detectFileType(file.name);
        const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
        
        if (!allowedTypes.includes(extension)) {
            alert(`File type ${extension} not allowed. Please use PDF, DOCX, MD, PNG, or JPG.`);
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            alert("File is too large. Maximum size is 10MB.");
            return;
        }

        const entry: ImportedFile = { name: file.name, type: fileType, status: "uploading", progress: 0 };

        setFiles((prev) => [...prev, entry]);

        try {
            // Convert DOCX to HTML using mammoth
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

            // Upload to Firebase Storage
            const path = generateStoragePath(projectId, file.name, "imports");
            const url = await uploadFile(file, path, (progress) => {
                setFiles((prev) =>
                    prev.map((f) => (f.name === file.name ? { ...f, progress } : f))
                );
            });

            // Save import record to Firestore
            await createReport({
                projectId,
                title: file.name.replace(/\.(pdf|docx|md)$/i, ""),
                course: "",
                sections: [],
                type: "imported",
                importedFileUrl: url,
                importedFileType: fileType ?? undefined,
            });

            setFiles((prev) =>
                prev.map((f) =>
                    f.name === file.name
                        ? { ...f, status: "done", url, htmlContent, mdContent, progress: 100 }
                        : f
                )
            );
            onImported?.();
        } catch (err) {
            setFiles((prev) =>
                prev.map((f) => (f.name === file.name ? { ...f, status: "error" } : f))
            );
        }
    };

    const onDrop = useCallback(
        (accepted: File[]) => accepted.forEach(processFile),
        [projectId]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "text/markdown": [".md"] },
        multiple: true,
    });

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                {...getRootProps()}
                className="rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all text-center"
                style={{
                    border: `2px dashed ${isDragActive ? "#1a7fd4" : "var(--border-color)"}`,
                    background: isDragActive ? "rgba(26,127,212,0.08)" : "var(--bg-card)",
                    minHeight: 140,
                }}
            >
                <input {...getInputProps()} />
                <Upload size={28} style={{ color: isDragActive ? "#1a7fd4" : "var(--text-muted)" }} />
                <div>
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                        {isDragActive ? "Drop files here" : "Drag & drop files here"}
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                        Supports PDF, DOCX, Markdown — Documents display inline
                    </p>
                </div>
                <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-xs font-medium"
                    style={{ background: "rgba(26,127,212,0.12)", color: "#60b8ff" }}
                >
                    Browse files
                </button>
            </div>

            {/* File list */}
            <AnimatePresence>
                {files.map((f) => (
                    <motion.div
                        key={f.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-4 rounded-2xl flex items-center gap-3"
                        style={{ border: "1px solid var(--border-color)", background: "var(--bg-card)" }}
                    >
                        <FileText size={18} style={{ color: "#60b8ff", flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                                {f.name}
                            </p>
                            {f.status === "uploading" && (
                                <div className="mt-1.5 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border-color)" }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{ width: `${f.progress}%`, background: "#1a7fd4" }}
                                    />
                                </div>
                            )}
                            {f.status === "done" && (
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                    Imported · {f.type?.toUpperCase()}
                                </p>
                            )}
                            {f.status === "error" && (
                                <p className="text-xs" style={{ color: "#f87171" }}>Upload failed</p>
                            )}
                        </div>

                        <div className="flex-shrink-0 flex items-center gap-2">
                            {f.status === "uploading" && <Loader2 size={16} className="animate-spin" style={{ color: "#60b8ff" }} />}
                            {f.status === "done" && (
                                <>
                                    <button
                                        onClick={() => setViewingFile(f)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-medium"
                                        style={{ background: "rgba(26,127,212,0.12)", color: "#60b8ff" }}
                                    >
                                        View
                                    </button>
                                    <CheckCircle2 size={16} style={{ color: "#4ade80" }} />
                                </>
                            )}
                            {f.status === "error" && <AlertCircle size={16} style={{ color: "#f87171" }} />}
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Inline document viewer modal */}
            <AnimatePresence>
                {viewingFile && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="w-full max-w-3xl max-h-[85dvh] flex flex-col rounded-2xl overflow-hidden"
                            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-color)" }}
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid var(--border-color)" }}>
                                <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
                                    {viewingFile.name}
                                </p>
                                <button
                                    onClick={() => setViewingFile(null)}
                                    className="w-8 h-8 flex items-center justify-center rounded-full"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-auto">
                                {viewingFile.type === "pdf" && viewingFile.url && (
                                    <iframe
                                        src={viewingFile.url}
                                        className="w-full h-full"
                                        style={{ minHeight: "60vh", border: "none" }}
                                        title={viewingFile.name}
                                    />
                                )}
                                {viewingFile.type === "docx" && viewingFile.htmlContent && (
                                    <div
                                        className="p-6 prose-content text-sm leading-relaxed"
                                        style={{ color: "var(--text-secondary)" }}
                                        dangerouslySetInnerHTML={{ __html: viewingFile.htmlContent }}
                                    />
                                )}
                                {viewingFile.type === "md" && viewingFile.mdContent && (
                                    <MarkdownPreview content={viewingFile.mdContent} />
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Lazy markdown renderer
function MarkdownPreview({ content }: { content: string }) {
    const ReactMarkdown = require("react-markdown").default;
    return (
        <div className="p-6">
            <ReactMarkdown
                className="prose-content text-sm leading-relaxed"
                components={{
                    h1: ({ children }: any) => <h1 style={{ color: "var(--text-primary)", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>{children}</h1>,
                    h2: ({ children }: any) => <h2 style={{ color: "var(--text-primary)", fontSize: "1.25rem", fontWeight: 600, marginBottom: "0.5rem" }}>{children}</h2>,
                    p: ({ children }: any) => <p style={{ color: "var(--text-secondary)", marginBottom: "0.75rem" }}>{children}</p>,
                    code: ({ children }: any) => <code style={{ background: "rgba(26,127,212,0.1)", padding: "0.1rem 0.375rem", borderRadius: "0.25rem", fontSize: "0.875em", color: "#60b8ff" }}>{children}</code>,
                    li: ({ children }: any) => <li style={{ color: "var(--text-secondary)", marginBottom: "0.25rem" }}>{children}</li>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
