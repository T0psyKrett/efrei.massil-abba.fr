"use client";

import { usePathname } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CourseProvider } from "@/contexts/CourseContext";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import BottomNav from "@/components/layout/BottomNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const isHomePage = pathname === "/";
  const isFullScreenPage = isLoginPage || isHomePage;

  return (
    <AuthProvider>
      <ThemeProvider>
        <CourseProvider>
          <div className="flex min-h-screen bg-[var(--bg-main)]">
            {!isFullScreenPage && <Sidebar />}
            
            <div className="flex-1 flex flex-col min-h-screen relative">
              {!isFullScreenPage && <Navbar />}
              
              <main className={`flex-1 ${!isFullScreenPage ? 'mt-[64px] p-4 sm:p-6 lg:p-10 pb-24 sm:pb-12' : ''}`}>
                {children}
              </main>

              {!isFullScreenPage && <BottomNav />}
            </div>
          </div>
        </CourseProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
