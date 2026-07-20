"use client";

import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, X } from "lucide-react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(() => import("./PDFViewer"), {
    ssr: false,
    loading: () => (
        <div className="flex items-center justify-center h-full bg-[#0D1B2A] text-[#3b9fd4] text-xs">
            Chargement de la visionneuse…
        </div>
    ),
});

interface PDFPreviewModalProps {
    open: boolean;
    onClose: () => void;
    pdfUrl: string | null | undefined;
    title?: string;
}

export default function PDFPreviewModal({
    open,
    onClose,
    pdfUrl,
    title = "Rapport PDF",
}: PDFPreviewModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    // Request native browser fullscreen when opening modal
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
            const elem = overlayRef.current;
            if (elem) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen().catch(() => {});
                } else if ((elem as any).webkitRequestFullscreen) {
                    (elem as any).webkitRequestFullscreen();
                }
            }
        } else {
            document.body.style.overflow = "";
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
            }
        }

        return () => {
            document.body.style.overflow = "";
        };
    }, [open]);

    const handleClose = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={overlayRef}
                    className="pdf-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    role="dialog"
                    aria-modal="true"
                    aria-label={`Visionneuse PDF Plein Écran : ${title}`}
                >
                    <motion.div
                        className="pdf-modal-panel overflow-hidden"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                    >
                        {pdfUrl ? (
                            <PDFViewer
                                url={pdfUrl}
                                title={title}
                                onClose={handleClose}
                                className="h-full w-full"
                            />
                        ) : (
                            <div className="flex flex-col h-full bg-[#0D1B2A] text-white">
                                {/* Header with close button */}
                                <div className="flex items-center justify-between p-4 border-b border-[#1a3049] bg-[#0f2035]">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-[#3b9fd4]">
                                        <FileText size={15} />
                                        <span>{title}</span>
                                    </div>
                                    <button
                                        onClick={handleClose}
                                        className="p-1.5 bg-[#112030] border border-red-500/30 rounded-lg text-red-400 hover:text-red-300 transition cursor-pointer"
                                        aria-label="Fermer"
                                    >
                                        <X size={15} />
                                    </button>
                                </div>

                                {/* Placeholder Body */}
                                <div className="flex-1 flex flex-col items-center justify-center p-8 gap-4 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-[#112030] border border-[#1a3049] flex items-center justify-center text-[#1B6CA8]">
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white mb-1">
                                            Aucun fichier PDF joint
                                        </h3>
                                        <p className="text-xs text-[#5c7d99] max-w-sm">
                                            Ce rapport a été rédigé directement dans l&apos;éditeur et ne possède pas de document PDF importé.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
