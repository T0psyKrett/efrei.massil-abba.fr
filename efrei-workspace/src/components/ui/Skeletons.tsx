"use client";

import { motion } from "framer-motion";

export const SkeletonCard = ({ delay = 0 }: { delay?: number }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay }}
        className="glass-card h-[220px] p-6 flex flex-col gap-4 animate-pulse"
    >
        <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
                <div className="h-5 w-3/4 bg-white/5 rounded-lg" />
                <div className="h-3 w-1/2 bg-white/5 rounded-lg" />
            </div>
            <div className="w-8 h-8 rounded-lg bg-white/5" />
        </div>
        <div className="space-y-2 mt-2">
            <div className="h-3 w-full bg-white/5 rounded-lg" />
            <div className="h-3 w-2/3 bg-white/5 rounded-lg" />
        </div>
        <div className="mt-auto flex gap-2">
            <div className="h-6 w-16 bg-white/5 rounded-md" />
            <div className="h-6 w-20 bg-white/5 rounded-md" />
        </div>
    </motion.div>
);

export const SkeletonStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 h-32 flex flex-col justify-center gap-3 animate-pulse">
                <div className="h-3 w-20 bg-white/5 rounded-md" />
                <div className="h-8 w-24 bg-white/5 rounded-md" />
            </div>
        ))}
    </div>
);
