"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface SidebarContextValue {
    collapsed: boolean;
    toggleCollapsed: () => void;
}

const SidebarContext = createContext<SidebarContextValue>({
    collapsed: false,
    toggleCollapsed: () => {},
});

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [collapsed, setCollapsed] = useState(false);
    const toggleCollapsed = () => setCollapsed((v) => !v);

    return (
        <SidebarContext.Provider value={{ collapsed, toggleCollapsed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    return useContext(SidebarContext);
}
