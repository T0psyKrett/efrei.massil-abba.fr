"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CourseProvider } from "@/contexts/CourseContext";
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

/** Inner component so it can read SidebarContext */
function LayoutInner({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { collapsed } = useSidebar();

    const isLoginPage      = pathname === "/admin/login";
    const isHomePage       = pathname === "/";
    const isFullScreenPage = isLoginPage || isHomePage;

    const sidebarWidth = collapsed ? 64 : 240;

    return (
        <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
            {!isFullScreenPage && <Sidebar />}

            <div
                className={`flex-1 flex flex-col min-h-screen relative transition-[margin] duration-300 ${
                    !isFullScreenPage ? "md:ml-[var(--sidebar-w,240px)]" : ""
                }`}
                style={
                    !isFullScreenPage
                        ? ({ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties)
                        : {}
                }
            >
                {!isFullScreenPage && <Navbar />}

                <main
                    className={`flex-1 ${
                        !isFullScreenPage
                            ? "mt-[64px] p-4 sm:p-6 lg:p-10 pb-24 sm:pb-12"
                            : ""
                    }`}
                >
                    {children}
                </main>

                {!isFullScreenPage && <BottomNav />}
            </div>
        </div>
    );
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <CourseProvider>
                    <SidebarProvider>
                        <LayoutInner>{children}</LayoutInner>
                    </SidebarProvider>
                </CourseProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
