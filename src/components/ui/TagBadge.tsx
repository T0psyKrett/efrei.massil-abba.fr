"use client";

interface TagBadgeProps {
    label: string;
    variant?: "default" | "tech" | "course";
}

const VARIANT_STYLES = {
    default: {
        background: "rgba(27,108,168,0.12)",
        color: "#3b9fd4",
        border: "1px solid rgba(27,108,168,0.28)",
    },
    tech: {
        background: "rgba(74,155,142,0.12)",
        color: "#5bbcad",
        border: "1px solid rgba(74,155,142,0.28)",
    },
    course: {
        background: "rgba(184,134,11,0.12)",
        color: "#d4a01a",
        border: "1px solid rgba(184,134,11,0.28)",
    },
};

export default function TagBadge({ label, variant = "default" }: TagBadgeProps) {
    const style = VARIANT_STYLES[variant];
    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
            style={{ ...style, fontFamily: "'JetBrains Mono', monospace" }}
        >
            {label}
        </span>
    );
}
