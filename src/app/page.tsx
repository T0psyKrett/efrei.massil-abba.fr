"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";

const NetworkBackground = dynamic(
    () => import("@/components/background/NetworkBackground"),
    { ssr: false }
);

const ROLES = ["Cybersecurity Student", "Pentester", "Builder"];
const TYPE_SPEED  = 55;
const ERASE_SPEED = 28;
const PAUSE_AFTER = 1600;

function useTypewriter(words: string[]) {
    const [display, setDisplay]   = useState("");
    const [frozen, setFrozen]     = useState(false);
    const wordIdxRef  = useRef(0);
    const charIdxRef  = useRef(0);
    const erasingRef  = useRef(false);
    const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const tick = () => {
            const current = words[wordIdxRef.current];
            const isLast  = wordIdxRef.current === words.length - 1;

            if (!erasingRef.current) {
                if (charIdxRef.current < current.length) {
                    charIdxRef.current += 1;
                    setDisplay(current.slice(0, charIdxRef.current));
                    timerRef.current = setTimeout(tick, TYPE_SPEED);
                } else if (isLast) {
                    setFrozen(true);
                } else {
                    timerRef.current = setTimeout(() => {
                        erasingRef.current = true;
                        tick();
                    }, PAUSE_AFTER);
                }
            } else {
                if (charIdxRef.current > 0) {
                    charIdxRef.current -= 1;
                    setDisplay(current.slice(0, charIdxRef.current));
                    timerRef.current = setTimeout(tick, ERASE_SPEED);
                } else {
                    erasingRef.current = false;
                    wordIdxRef.current += 1;
                    timerRef.current = setTimeout(tick, 300);
                }
            }
        };
        timerRef.current = setTimeout(tick, 600);
        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { display, frozen };
}

export default function HomePage() {
    const { display: role, frozen } = useTypewriter(ROLES);

    return (
        <div
            className="dark relative flex w-full min-h-[100dvh] flex-col items-center justify-center text-center px-6 overflow-hidden"
            style={{ background: "#0D1B2A" }}
        >
            <NetworkBackground />

            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(13,27,42,0.2) 0%, rgba(13,27,42,0.88) 100%)",
                    zIndex: 1,
                }}
            />

            <div className="relative z-10 max-w-2xl mx-auto">

                {/* ── Logos ── */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex items-center justify-center gap-10 mb-8"
                >
                    <div
                        className="transition-all duration-300 hover:drop-shadow-[0_0_28px_rgba(59,159,212,0.45)]"
                        style={{ borderRadius: 18, overflow: "hidden" }}
                    >
                        <Image
                            src="/Logo_EFREI_New.png"
                            alt="EFREI Paris"
                            width={280}
                            height={93}
                            priority
                            style={{ height: "auto", objectFit: "contain", display: "block" }}
                        />
                    </div>

                    <div style={{ width: 1, height: 90, background: "rgba(59,159,212,0.25)" }} />

                    <div
                        className="rounded-full overflow-hidden transition-all duration-300 hover:drop-shadow-[0_0_28px_rgba(59,159,212,0.45)]"
                        style={{ width: 150, height: 150 }}
                    >
                        <Image
                            src="/Logo ABBA.jpg"
                            alt="Massil Abba — Cybersecurity student at EFREI Paris"
                            width={150}
                            height={150}
                            priority
                            style={{ objectFit: "cover" }}
                        />
                    </div>
                </motion.div>

                {/* spacer */}
                <div className="mb-10" />

                {/* ── Single CTA ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Link
                        href="/reports"
                        id="cta-enter-workspace"
                        className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-semibold transition-all duration-200"
                        style={{
                            background: "linear-gradient(135deg, #1B6CA8, #0f4d7d)",
                            color: "#ffffff",
                            boxShadow: "0 0 30px rgba(27,108,168,0.45), inset 0 1px 0 rgba(255,255,255,0.12)",
                        }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow =
                                "0 0 50px rgba(27,108,168,0.65), inset 0 1px 0 rgba(255,255,255,0.18)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.boxShadow =
                                "0 0 30px rgba(27,108,168,0.45), inset 0 1px 0 rgba(255,255,255,0.12)";
                        }}
                    >
                        Enter Workspace
                        <ArrowRight
                            size={15}
                            className="transition-transform duration-200 group-hover:translate-x-0.5"
                        />
                    </Link>
                </motion.div>
            </div>
        </div>
    );
}
