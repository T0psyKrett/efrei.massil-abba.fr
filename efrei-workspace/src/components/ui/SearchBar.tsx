"use client";

import { useState } from "react";
import { Search, X } from "lucide-react";

interface SearchBarProps {
    onSearch: (term: string) => void;
    placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = "Search projects, tags, technologies…" }: SearchBarProps) {
    const [value, setValue] = useState("");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onSearch(e.target.value);
    };

    const clear = () => {
        setValue("");
        onSearch("");
    };

    return (
        <div className="relative w-full">
            <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
            />
            <input
                type="search"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                className="w-full rounded-xl text-[13px] outline-none transition-all"
                style={{
                    height: 48,
                    paddingLeft: 44,
                    paddingRight: 44,
                    background: "var(--bg-card)",
                    border: "1px solid var(--border-color)",
                    color: "var(--text-primary)",
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(26,127,212,0.5)";
                    e.currentTarget.style.boxShadow = "0 0 12px rgba(26,127,212,0.1)";
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-color)";
                    e.currentTarget.style.boxShadow = "none";
                }}
            />
            {value && (
                <button
                    onClick={clear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg"
                    style={{ color: "var(--text-muted)", background: "rgba(26,127,212,0.06)" }}
                    aria-label="Clear search"
                >
                    <X size={13} />
                </button>
            )}
        </div>
    );
}
