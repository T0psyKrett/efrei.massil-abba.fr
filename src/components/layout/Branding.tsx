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
    showNames = false,
    className = "",
    gap = 10,
    logoSize = 32,
    showProfileImage = true,
}: BrandingProps) {
    return (
        <div className={`flex items-center ${className}`} style={{ gap }}>
            {/* EFREI logo */}
            <div
                style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "white",
                    flexShrink: 0,
                    lineHeight: 0,
                    padding: "3px 6px",
                }}
            >
                <Image
                    src="/Logo_EFREI_New.png"
                    alt="EFREI Paris"
                    width={logoSize * 3}
                    height={logoSize}
                    style={{ height: logoSize, width: "auto", display: "block", objectFit: "contain" }}
                    priority
                />
            </div>

            {showProfileImage && (
                <>
                    <div
                        style={{
                            width: 1,
                            height: 16,
                            background: "rgba(255,255,255,0.15)",
                            flexShrink: 0,
                        }}
                    />
                    <div
                        style={{
                            borderRadius: "50%",
                            overflow: "hidden",
                            width: logoSize,
                            height: logoSize,
                            flexShrink: 0,
                        }}
                    >
                        <Image
                            src="/Logo ABBA.jpg"
                            alt="Massil Abba"
                            width={logoSize}
                            height={logoSize}
                            style={{ height: logoSize, width: logoSize, display: "block", objectFit: "cover" }}
                        />
                    </div>
                </>
            )}
        </div>
    );
}
