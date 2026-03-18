import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";

export const metadata: Metadata = {
  title: "EFREI Paris — Massil Abba | Cybersecurity Workspace",
  description: "Cybersecurity portfolio showcasing penetration testing reports, network architecture projects, and security research by Massil Abba at EFREI Paris.",
  keywords: ["Cybersecurity", "Penetration Testing", "Network Security", "EFREI Paris", "Massil Abba", "Security Reports"],
  authors: [{ name: "Massil Abba" }],
  openGraph: {
    title: "EFREI Paris — Massil Abba | Cybersecurity Workspace",
    description: "Cybersecurity portfolio showcasing projects and reports.",
    url: "https://efrei.massil-abba.fr",
    siteName: "Massil Abba Workspace",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "EFREI Paris — Massil Abba | Cybersecurity Workspace",
    description: "Cybersecurity portfolio showcasing projects and reports.",
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
