"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card text-center p-12 max-w-md w-full border-red-500/20"
            >
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <h1 className="text-2xl font-bold mb-3 text-white tracking-tight">System Exception</h1>
                <p className="text-gray-400 text-[14px] mb-8 leading-relaxed">
                    A critical error occurred while processing your request. Our systems have been notified.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => reset()}
                        className="btn-primary w-full justify-center gap-2"
                        style={{ background: "#EF4444", boxShadow: "0 0 20px rgba(239, 68, 68, 0.2)" }}
                    >
                        <RefreshCcw size={16} />
                        Attempt Recovery
                    </button>
                    <Link
                        href="/"
                        className="btn-secondary w-full justify-center gap-2"
                    >
                        <Home size={16} />
                        Return to Home
                    </Link>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                        Error ID: {error.digest || "SYSTEM_ABORT"}
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
