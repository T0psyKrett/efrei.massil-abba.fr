"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Trash2, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "info";
}

export default function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const accentColor = variant === "danger" ? "#ef4444" : "#3B82F6";

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-[6px]"
                />

                {/* Modal Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 350 }}
                    className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0d1528]/80 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                >
                    {/* Header with Icon */}
                    <div className="p-8">
                        <div className="mb-6 flex items-center gap-4">
                            <div 
                                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                                style={{ 
                                    background: `rgba(${variant === "danger" ? "239, 68, 68" : "59, 130, 246"}, 0.1)`,
                                    border: `1px solid rgba(${variant === "danger" ? "239, 68, 68" : "59, 130, 246"}, 0.2)`
                                }}
                            >
                                {variant === "danger" ? (
                                    <Trash2 size={24} style={{ color: accentColor }} />
                                ) : (
                                    <AlertCircle size={24} style={{ color: accentColor }} />
                                )}
                            </div>
                            <h3 className="text-xl font-bold tracking-tight text-white">{title}</h3>
                        </div>

                        <p className="text-[15px] leading-relaxed text-slate-400">
                            {message}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 border-t border-white/5 bg-white/[0.02] p-6">
                        <button
                            onClick={onClose}
                            className="flex-1 rounded-xl bg-white/5 py-3 text-sm font-semibold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="flex-1 rounded-xl py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95"
                            style={{ background: accentColor }}
                        >
                            {confirmText}
                        </button>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 rounded-full p-2 text-slate-500 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <X size={18} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
