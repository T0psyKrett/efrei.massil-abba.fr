"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Cpu, Server, Database, Code, Shield } from "lucide-react";
import { getProjects, Project } from "@/services/firestoreService";
import { useAuth } from "@/contexts/AuthContext";

export default function TechnologiesPage() {
    const { isAdmin } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProjects()
            .then((p) => {
                setProjects(p);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const visibleProjects = isAdmin ? projects : projects.filter((p) => p.published !== false);

    // Aggregate technologies
    const techCounts: Record<string, number> = {};
    visibleProjects.forEach((p) => {
        (p.technologies || []).forEach((tech) => {
            const normalizedTech = tech.trim();
            if (normalizedTech) {
                techCounts[normalizedTech] = (techCounts[normalizedTech] || 0) + 1;
            }
        });
    });

    // Sort by count descending
    const sortedTechs = Object.entries(techCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count }));

    // Helper to get an icon based on tech name
    const getTechIcon = (name: string) => {
        const lowerName = name.toLowerCase();
        if (lowerName.includes("linux") || lowerName.includes("server") || lowerName.includes("cisco")) return Server;
        if (lowerName.includes("sql") || lowerName.includes("database") || lowerName.includes("db")) return Database;
        if (lowerName.includes("python") || lowerName.includes("bash") || lowerName.includes("code") || lowerName.includes("web")) return Code;
        if (lowerName.includes("security") || lowerName.includes("audit") || lowerName.includes("firewall") || lowerName.includes("pfsense")) return Shield;
        return Cpu;
    };

    return (
        <div className="py-10">
            {/* Page Header */}
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
                <div className="flex items-center gap-3 mb-1.5">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(16, 185, 129, 0.10)", border: "1px solid rgba(16, 185, 129, 0.20)" }}>
                        <Cpu size={17} style={{ color: "#10B981" }} />
                    </div>
                    <h1 className="text-[28px] font-bold" style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
                        Technologies
                    </h1>
                </div>
                <p className="text-[13px] mt-2 mb-6" style={{ color: "var(--text-muted)" }}>
                    Overview of all technologies, tools, and platforms utilized across projects.
                </p>
            </motion.div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-28 rounded-xl animate-pulse bg-[var(--bg-card)] border border-[var(--border-color)]" />
                    ))}
                </div>
            ) : sortedTechs.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-[13px] text-gray-500">No technologies found. Add some to your projects!</p>
                </div>
            ) : (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                    {sortedTechs.map((tech, index) => {
                        const Icon = getTechIcon(tech.name);
                        return (
                            <motion.div
                                key={tech.name}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className="glass-card flex flex-col justify-center gap-3"
                                style={{ padding: "16px 20px" }}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="w-9 h-9 flex items-center justify-center rounded-lg"
                                        style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                                        <Icon size={16} color="#10B981" />
                                    </div>
                                    <span className="text-[11px] font-bold py-1 px-2.5 rounded-full"
                                        style={{ background: "var(--bg-secondary)", color: "var(--text-muted)", border: "1px solid var(--border-color)" }}>
                                        {tech.count} {tech.count === 1 ? 'Project' : 'Projects'}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-[15px]" style={{ color: "var(--text-primary)" }}>
                                        {tech.name}
                                    </h3>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            )}
        </div>
    );
}

