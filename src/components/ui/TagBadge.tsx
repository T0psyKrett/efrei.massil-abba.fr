"use client";

interface TagBadgeProps {
    label: string;
    variant?: "default" | "tech" | "course";
}

const VARIANT_STYLES = {
    default: {
        background: "rgba(26,127,212,0.12)",
        color: "#60b8ff",
        border: "1px solid rgba(26,127,212,0.25)",
    },
    tech: {
        background: "rgba(56,189,248,0.1)",
        color: "#38bdf8",
        border: "1px solid rgba(56,189,248,0.25)",
    },
    course: {
        background: "rgba(139,92,246,0.1)",
        color: "#c4b5fd",
        border: "1px solid rgba(139,92,246,0.25)",
    },
};

export default function TagBadge({ label, variant = "default" }: TagBadgeProps) {
    const style = VARIANT_STYLES[variant];
    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap"
            style={style}
        >
            {label}
        </span>
    );
}
