"use client";

import Image from "next/image";

interface BrandingProps {
    showNames?: boolean;
    className?: string;
    gap?: number;
    logoSize?: number;
    showProfileImage?: boolean;
}

export default function Branding({
    showNames = true,
    className = "",
    gap = 12,
    logoSize = 32,
    showProfileImage = true
}: BrandingProps) {
    return (
        <div className={`flex items-center ${className}`} style={{ gap }}>
            {/* Minimalist logo group */}
            <div className="flex items-center gap-3">
                {/* EFREI logo */}
                <div className="flex items-center" style={{ borderRadius: 8, overflow: "hidden", background: "white" }}>
                    <img
                        src="/Logo_EFREI.png"
                        alt="EFREI Paris"
                        style={{
                            height: logoSize,
                            width: "auto",
                            display: "block",
                            objectFit: "contain",
                        }}
                    />
                </div>
                
                {showProfileImage && (
                    <div className="flex items-center gap-3">
                        {/* 1px vertical divider */}
                        <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.15)", flexShrink: 0 }} />
                        {/* ABBA logo */}
                        <div style={{
                            borderRadius: "50%",
                            overflow: "hidden",
                            width: logoSize,
                            height: logoSize,
                            flexShrink: 0,
                        }}>
                            <Image
                                src="/Logo ABBA.jpg"
                                alt="Massil Abba"
                                width={logoSize}
                                height={logoSize}
                                style={{ height: logoSize, width: logoSize, display: "block", objectFit: "cover" }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {showNames && (
                <div className="ml-1 leading-tight hidden sm:block">
                    <p className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
                        Massil Abba
                    </p>
                    <p className="text-[10px] uppercase tracking-widest font-medium" style={{ color: "#71717A" }}>
                        Cybersecurity
                    </p>
                </div>
            )}
        </div>
    );
}
