"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import NetworkBackground from "@/components/background/NetworkBackground";

export default function HomePage() {
  return (
    <div className="dark relative flex w-full min-h-[100dvh] flex-col items-center justify-center text-center px-6 overflow-hidden bg-black"
    >
      {/* Animated background */}
      <NetworkBackground />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(5,11,24,0.3) 0%, rgba(5,11,24,0.85) 100%)", zIndex: 1 }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Subtle Accent Title */}
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-[11px] font-bold tracking-[0.3em] uppercase mb-8"
          style={{ color: "#60b8ff" }}
        >
          Cybersecurity
        </motion.p>

        {/* Logos Layout */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex items-center justify-center gap-10 mb-[32px]"
        >
          <div className="relative flex items-center justify-center transition-all duration-300 hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-default">
            {/* Optimizing with Next.js Image */}
            <Image
              src="/Logo_EFREI_New.png"
              alt="EFREI Paris"
              width={300}
              height={100}
              priority
              style={{ height: "auto", objectFit: "contain", borderRadius: 16, overflow: "hidden" }}
            />
          </div>

          <div style={{ width: 1, height: 100, background: "rgba(255,255,255,0.3)" }} />

          <div className="relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-300 hover:drop-shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-default"
            style={{ width: 160, height: 160 }}
          >
            {/* Optimizing with Next.js Image */}
            <Image
              src="/Logo ABBA.jpg"
              alt="Massil Abba"
              width={160}
              height={160}
              priority
              style={{ objectFit: "cover" }}
            />
          </div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base sm:text-lg mb-10"
          style={{ color: "rgba(138,180,216,0.8)" }}
        >
          Projects and reports.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-semibold transition-all"
            style={{
              background: "#1a7fd4",
              color: "#ffffff",
              boxShadow: "0 0 30px rgba(26,127,212,0.4)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 0 50px rgba(26,127,212,0.6)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 0 30px rgba(26,127,212,0.4)")}
          >
            Enter Workspace
            <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* EFREI badge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-10 text-xs tracking-widest uppercase"
          style={{ color: "#4a7a9b" }}
        >
          EFREI Paris — Massil Abba
        </motion.p>
      </div>
    </div>
  );
}
