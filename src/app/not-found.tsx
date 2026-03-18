"use client";

import { motion } from "framer-motion";
import { Search, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
            >
                <div className="relative inline-block mb-8">
                    <motion.div
                        animate={{ 
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0]
                        }}
                        transition={{ 
                            duration: 4, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        className="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20"
                    >
                        <Search className="text-blue-500" size={40} />
                    </motion.div>
                </div>

                <h1 className="text-5xl font-black mb-4 text-white tracking-tighter">404</h1>
                <h2 className="text-xl font-bold mb-3 text-white">Segment Not Found</h2>
                <p className="text-gray-400 text-[14px] mb-10 max-w-xs mx-auto leading-relaxed">
                    The intelligence you are looking for does not exist or has been relocated to another sector.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="btn-secondary w-full sm:w-auto px-8 gap-2"
                    >
                        <ArrowLeft size={16} />
                        Go Back
                    </button>
                    <Link
                        href="/"
                        className="btn-primary w-full sm:w-auto px-8 gap-2"
                    >
                        <Home size={16} />
                        Base Command
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
