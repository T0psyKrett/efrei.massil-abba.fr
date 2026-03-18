"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ArrowRight, Eye, EyeOff } from "lucide-react";
import { Project, updateProject } from "@/services/firestoreService";
import TagBadge from "./TagBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

interface ProjectCardProps {
    project: Project;
    delay?: number;
}

export default function ProjectCard({ project, delay = 0 }: ProjectCardProps) {
    const { isAdmin } = useAuth();
    const [isPublished, setIsPublished] = useState(project.published !== false);
    const [isToggling, setIsToggling] = useState(false);

    const handleTogglePublish = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isToggling) return;
        setIsToggling(true);
        try {
            const newState = !isPublished;
            await updateProject(project.id!, { published: newState, status: newState ? "published" : "hidden" });
            setIsPublished(newState);
        } catch (error) {
            console.error("Failed to update status", error);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className="h-full"
        >
            <Link href={`/projects/${project.id}`} className="block h-full">
                <div className="glass-card h-full flex flex-col group cursor-pointer" style={{ padding: 24 }}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                                <h3
                                    className="font-semibold text-[15px] leading-snug truncate transition-colors group-hover:text-[#60b8ff]"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    {project.title}
                                </h3>
                                {isAdmin && (
                                    <button
                                        onClick={handleTogglePublish}
                                        disabled={isToggling}
                                        aria-label={isPublished ? "Unpublish project" : "Publish project"}
                                        className={`relative flex items-center rounded-full transition-colors focus:outline-none flex-shrink-0 ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
                                        style={{
                                            width: 54,
                                            height: 28,
                                            background: isPublished ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.1)",
                                            border: `1px solid ${isPublished ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.2)"}`,
                                        }}
                                        title={isPublished ? "Unpublish" : "Publish"}
                                    >
                                        <motion.div
                                            className="absolute rounded-full"
                                            style={{
                                                width: 22,
                                                height: 22,
                                                top: 2,
                                                background: isPublished ? "#22c55e" : "#ef4444",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                            }}
                                            initial={false}
                                            animate={{ left: isPublished ? 28 : 2 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                        <div className="relative z-10 flex items-center w-full justify-between px-[5px] pointer-events-none">
                                            <Eye size={12} style={{ color: isPublished ? "#fff" : "rgba(239,68,68,0.8)", transition: "color 0.2s" }} />
                                            <EyeOff size={12} style={{ color: !isPublished ? "#fff" : "rgba(34,197,94,0.8)", transition: "color 0.2s" }} />
                                        </div>
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-[11px]" style={{ color: "var(--text-muted)" }}>
                                <span className="flex items-center gap-1">
                                    <BookOpen size={10} />
                                    {project.course}
                                </span>
                            </div>
                        </div>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0"
                            style={{ background: "rgba(26,127,212,0.1)" }}
                        >
                            <ArrowRight size={13} style={{ color: "#60b8ff" }} />
                        </div>
                    </div>

                    {/* Description */}
                    {project.description && (
                        <p className="text-[13px] leading-relaxed line-clamp-2 mb-4" style={{ color: "var(--text-secondary)" }}>
                            {project.description}
                        </p>
                    )}

                    {/* Tags */}
                    {(project.tags?.length > 0 || project.technologies?.length > 0) && (
                        <div className="flex flex-wrap gap-1.5 mt-auto">
                            {project.tags?.slice(0, 3).map((tag) => (
                                <TagBadge key={tag} label={tag} variant="default" />
                            ))}
                            {project.technologies?.slice(0, 2).map((tech) => (
                                <TagBadge key={tech} label={tech} variant="tech" />
                            ))}
                            {(project.tags?.length + project.technologies?.length) > 5 && (
                                <span className="text-[10px] py-1 px-2" style={{ color: "var(--text-muted)" }}>
                                    +{(project.tags?.length + project.technologies?.length) - 5} more
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </Link>
        </motion.div>
    );
}
