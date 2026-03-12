"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSettings, Course, SiteSettings } from "@/services/firestoreService";

interface CourseContextType {
    courses: Course[];
    settings: SiteSettings | null;
    loading: boolean;
    refreshSettings: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType>({
    courses: [],
    settings: null,
    loading: true,
    refreshSettings: async () => { },
});

export function CourseProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const loadSettings = async () => {
        try {
            const s = await getSettings();
            setSettings(s);
        } catch (error) {
            console.error("Failed to load settings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    return (
        <CourseContext.Provider value={{
            courses: settings?.courses || [],
            settings,
            loading,
            refreshSettings: loadSettings
        }}>
            {children}
        </CourseContext.Provider>
    );
}

export const useCourses = () => useContext(CourseContext);
