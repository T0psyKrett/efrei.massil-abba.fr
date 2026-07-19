"use client";

import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path, Line, Polyline, Rect, Circle } from "@react-pdf/renderer";
import parse, { domToReact, DOMNode, Element, Text as DOMText } from "html-react-parser";
import { Report, SiteSettings } from "@/services/firestoreService";

// Register fonts
Font.register({
    family: "Inter",
    fonts: [
        { src: "/fonts/Inter-Regular.ttf" },
        { src: "/fonts/Inter-Bold.ttf", fontWeight: "bold" },
    ]
});

Font.register({
    family: "JetBrains Mono",
    fonts: [
        { src: "/fonts/JetBrainsMono-Regular.ttf" },
        { src: "/fonts/JetBrainsMono-Bold.ttf", fontWeight: "bold" },
    ]
});

// PDF Styles
const styles = StyleSheet.create({
    page: { padding: 40, backgroundColor: "#FFFFFF", fontFamily: "Inter" },
    coverPage: { backgroundColor: "#FFFFFF", padding: 40, position: "relative", flexDirection: "column", alignItems: "center", justifyContent: "space-between", height: "100%" },
    coverTopBar: { position: "absolute", top: 0, left: 0, right: 0, height: 6 },
    coverLogoContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 25, marginBottom: 15 },
    coverLogoEfreiWrapper: { backgroundColor: "#FFFFFF", paddingVertical: 4, paddingHorizontal: 10, borderRadius: 8, border: "1px solid #E2E8F0", justifyContent: "center", alignItems: "center" },
    coverLogoEfrei: { width: 85, height: 24, objectFit: "contain" },
    coverLogoDivider: { width: 1, height: 26, backgroundColor: "#E2E8F0" },
    coverLogoAbbaWrapper: { borderRadius: 14, overflow: "hidden", borderWidth: 1.5, borderColor: "#E2E8F0", width: 28, height: 28 },
    coverLogoAbba: { width: 28, height: 28, objectFit: "cover" },
    coverTitleContainer: { alignItems: "center", width: "100%", marginBottom: 15 },
    coverTitle: { color: "#1B6CA8", fontSize: 24, fontWeight: "bold", textAlign: "center", paddingHorizontal: 20, marginBottom: 12 },
    coverTitleUnderline: { width: "70%", height: 1, backgroundColor: "#E2E8F0" },
    coverDetailsContainer: { alignItems: "center", gap: 4, marginBottom: 25 },
    coverDetailText: { fontSize: 10, color: "#475569" },
    coverDetailLabel: { fontWeight: "bold", color: "#0F172A" },
    coverDetailValue: { color: "#334155" },
    coverSketchContainer: { alignItems: "center", width: "100%", marginBottom: 15 },
    coverSketch: { width: 320, height: 140, objectFit: "contain" },
    coverPaletteContainer: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 },
    coverPaletteBlock: { width: 30, height: 8, borderRadius: 2 },
    coverFooter: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #E2E8F0", paddingTop: 10, marginTop: 20 },
    coverFooterText: { fontSize: 8, color: "#94A3B8", fontFamily: "JetBrains Mono" },
    
    // Content Layout
    sectionHeader: { backgroundColor: "#0d1528", borderRadius: 6, padding: 6, paddingLeft: 12, marginBottom: 8, marginTop: 12, flexDirection: "row", alignItems: "center" },
    sectionHeaderLeft: { flexDirection: "column" },
    sectionPhase: { color: "#64748B", fontSize: 6, fontWeight: "bold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 1 },
    sectionNumberRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    sectionNumber: { color: "#94A3B8", fontSize: 16, fontFamily: "JetBrains Mono", opacity: 0.5 },
    sectionDivider: { width: 1, height: 18, backgroundColor: "rgba(255,255,255,0.1)", marginHorizontal: 10 },
    sectionTitle: { color: "#FFFFFF", fontSize: 12, fontWeight: "bold", flex: 1 },
    
    // Typography
    p: { fontSize: 10.5, color: "#334155", marginBottom: 10, lineHeight: 1.6 },
    strong: { fontWeight: "bold", color: "#0f172a" },
    h3: { fontSize: 14, fontWeight: "bold", color: "#0f172a", marginTop: 16, marginBottom: 8, borderLeft: "4px solid #F97316", paddingLeft: 8 },
    h4: { fontSize: 12, fontWeight: "bold", color: "#0f172a", marginTop: 12, marginBottom: 6, borderLeft: "4px solid #3B82F6", paddingLeft: 8 },
    
    // Terminal Frame
    preContainer: { backgroundColor: "#1a1a2a", borderRadius: 8, padding: 0, marginBottom: 16, marginTop: 8, overflow: "hidden", border: "1px solid #1e293b" },
    pre: { padding: 16, paddingTop: 8, fontFamily: "JetBrains Mono", fontSize: 9, color: "#e2e8f0" },
    macHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", backgroundColor: "#1e293b", borderBottom: "1px solid #334155" },
    macDotsContainer: { flexDirection: "row", gap: 6 },
    macDotRed: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#ff5f57" },
    macDotYellow: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#ffbd2e" },
    macDotGreen: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#28c840" },
    macLabel: { fontSize: 7, fontFamily: "JetBrains Mono", color: "#94A3B8", opacity: 0.8 },
    
    // Badges
    badge: { paddingVertical: 1, paddingHorizontal: 6, borderRadius: 4, fontSize: 8, fontWeight: "bold", marginLeft: 4, marginRight: 4 },
    badgeRunning: { backgroundColor: "#DCFCE7", color: "#166534" },
    badgeWarning: { backgroundColor: "#FEF9C3", color: "#854D0E" },
    badgeError: { backgroundColor: "#FEE2E2", color: "#991B1B" },
    badgeInfo: { backgroundColor: "#DBEAFE", color: "#1E40AF" },
    
    // Callouts
    callout: { padding: 12, marginVertical: 10, borderRadius: 4, borderLeftWidth: 4 },
    calloutWarning: { borderColor: "#F97316", backgroundColor: "#FFF7ED", color: "#c2410c" },
    calloutInfo: { borderColor: "#3B82F6", backgroundColor: "#EFF6FF", color: "#1e3a8a" },
    calloutSuccess: { borderColor: "#10B981", backgroundColor: "#ECFDF5", color: "#064e3b" },
    calloutDanger: { borderColor: "#EF4444", backgroundColor: "#FFF1F2", color: "#7f1d1d" },

    table: { width: "100%", border: "1px solid #E5E7EB", borderRadius: 4, marginBottom: 12 },
    tr: { flexDirection: "row", borderBottom: "1px solid #E5E7EB" },
    th: { backgroundColor: "#0d1528", color: "#FFFFFF", fontSize: 9, fontWeight: "bold", padding: 8, flex: 1, textTransform: "uppercase" },
    td: { fontSize: 9, color: "#334155", padding: 8, flex: 1 },
    li: { flexDirection: "row", marginBottom: 4, paddingLeft: 10 },
    bullet: { width: 10, fontSize: 11, color: "#334155" },
    imageContent: { width: "100%", height: "auto" },
    footerContainer: { position: "absolute", bottom: 20, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", borderTop: "1px solid #E5E7EB", paddingTop: 10 },
    footerText: { fontSize: 8, color: "#94A3B8" }
});

const PdfIcon = ({ name, color }: { name: string, color: string }) => {
    switch (name) {
        case "Network":
            return (
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Rect x="16" y="16" width="6" height="6" rx="1" ry="1" />
                    <Rect x="2" y="16" width="6" height="6" rx="1" ry="1" />
                    <Rect x="9" y="2" width="6" height="6" rx="1" ry="1" />
                    <Path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
                    <Path d="M12 12V8" />
                </Svg>
            );
        case "Settings":
            return (
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="12" cy="12" r="3" />
                    <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </Svg>
            );
        case "Shield":
            return (
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2-1 4-2 6-3.81c1.38 1.25 3.5 2.5 6 3.8a1 1 0 0 1 1 1v7z" />
                </Svg>
            );
        case "Terminal":
        default:
            return (
                <Svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Polyline points="4 17 10 11 4 5" />
                    <Line x1="12" y1="19" x2="20" y2="19" />
                </Svg>
            );
    }
};

const parseHtmlToPdf = (htmlString: string) => {
    const processHtml = (raw: string) => {
        if (typeof window === "undefined") return raw;
        const origin = window.location.origin;
        
        let processed = raw.replace(/src="(\/[^"]+)"/g, `src="${origin}$1"`);
        
        processed = processed.replace(/\b(RUNNING)\b/g, '<span class="pdf-badge-running">$1</span>');
        processed = processed.replace(/\b(WARNING)\b/g, '<span class="pdf-badge-warning">$1</span>');
        processed = processed.replace(/\b(ERROR)\b/g, '<span class="pdf-badge-error">$1</span>');
        processed = processed.replace(/\b(INFO)\b/g, '<span class="pdf-badge-info">$1</span>');
        
        processed = processed.replace(/<p>⚠️\s*ATTENTION/g, '<p class="pdf-callout-warning">⚠️ ATTENTION');
        processed = processed.replace(/<p>📝\s*NOTE/g, '<p class="pdf-callout-info">📝 NOTE');
        processed = processed.replace(/<p>✅\s*SUCCESS/g, '<p class="pdf-callout-success">✅ SUCCESS');
        processed = processed.replace(/<p>❌\s*DANGER/g, '<p class="pdf-callout-danger">❌ DANGER');
        
        return processed;
    };

    const options = {
        replace: (node: any) => {
            const domNode = node as DOMNode;
            
            // Text nodes MUST be wrapped in <Text> to be valid inside a <View>
            if (domNode.type === 'text') {
                return <Text style={styles.p}>{(domNode as DOMText).data}</Text>;
            }

            if (domNode.type === "tag") {
                const element = domNode as Element;
                const className = element.attribs.class || "";
                
                // Recursively process children
                const children = domToReact(element.children as any, options);

                switch (element.name) {
                    case "p": {
                        let viewStyle: any = { flexDirection: "row", flexWrap: "wrap", width: "100%", marginBottom: 10 };
                        
                        if (className.includes("pdf-callout-warning")) {
                            viewStyle = [styles.callout, styles.calloutWarning, { marginBottom: 10, padding: 12 }];
                        } else if (className.includes("pdf-callout-info")) {
                            viewStyle = [styles.callout, styles.calloutInfo, { marginBottom: 10, padding: 12 }];
                        } else if (className.includes("pdf-callout-success")) {
                            viewStyle = [styles.callout, styles.calloutSuccess, { marginBottom: 10, padding: 12 }];
                        } else if (className.includes("pdf-callout-danger")) {
                            viewStyle = [styles.callout, styles.calloutDanger, { marginBottom: 10, padding: 12 }];
                        }
                        return <View key={Math.random()} style={viewStyle}>{children}</View>;
                    }
                    case "span": {
                        let style: any = styles.p;
                        if (className.includes("pdf-badge-running")) style = [styles.badge, styles.badgeRunning];
                        else if (className.includes("pdf-badge-warning")) style = [styles.badge, styles.badgeWarning];
                        else if (className.includes("pdf-badge-error")) style = [styles.badge, styles.badgeError];
                        else if (className.includes("pdf-badge-info")) style = [styles.badge, styles.badgeInfo];
                        
                        // Use View for badges/spans that might act as containers
                        return <View key={Math.random()} style={{ flexDirection: "row", flexWrap: "wrap" }}><Text style={style}>{children}</Text></View>;
                    }
                    case "strong":
                    case "b":
                        // Wrap children in Text with strong style. Nesting Text in Text is safe.
                        return <Text key={Math.random()} style={styles.strong}>{children}</Text>;
                    case "h3": 
                    case "h4": 
                        return (
                            <View key={Math.random()} style={[element.name === "h3" ? styles.h3 : styles.h4, { borderLeftWidth: 4, paddingLeft: 8, flexDirection: "row", flexWrap: "wrap" }]}>
                                {children}
                            </View>
                        );
                    case "pre": 
                        return (
                            <View key={Math.random()} style={styles.preContainer} wrap={false}>
                                <View style={styles.macHeader}>
                                    <View style={styles.macDotsContainer}><View style={styles.macDotRed} /><View style={styles.macDotYellow} /><View style={styles.macDotGreen} /></View>
                                    <Text style={styles.macLabel}>Terminal</Text>
                                </View>
                                <View style={styles.pre}><View style={{ flexDirection: "row", flexWrap: "wrap" }}>{children}</View></View>
                            </View>
                        );
                    case "table": return <View key={Math.random()} style={styles.table}>{children}</View>;
                    case "tr": return <View key={Math.random()} style={styles.tr}>{children}</View>;
                    case "th": return <View key={Math.random()} style={styles.th}><Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>{children}</Text></View>;
                    case "td": return <View key={Math.random()} style={styles.td}>{children}</View>;
                    case "ul": return <View key={Math.random()} style={{ marginVertical: 4 }}>{children}</View>;
                    case "li": return (
                        <View key={Math.random()} style={styles.li}>
                            <Text style={styles.bullet}>•</Text>
                            <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>{children}</View>
                        </View>
                    );
                    case "img": return <Image key={Math.random()} src={element.attribs.src} style={styles.imageContent} />;
                    case "br": return <Text key={Math.random()}>{"\n"}</Text>;
                    case "div": return <View key={Math.random()} style={{ width: "100%", flexDirection: "row", flexWrap: "wrap" }}>{children}</View>;
                    default:
                        // Return as is, usually will be a collection of Text nodes from children
                        return children; 
                }
            }
        }
    };

    const cleanHtml = processHtml(htmlString);
    try {
        const parsed = parse(cleanHtml, options);
        return <View style={{ width: "100%" }}>{parsed}</View>;
    } catch (e) {
        console.error("PDF Parsing error:", e);
        return <Text style={styles.p}>{htmlString.replace(/<[^>]*>?/gm, '')}</Text>;
    }
};
const DOMAIN_ACCENT: Record<string, string> = {
    network:    "#4A9B8E",
    networking: "#4A9B8E",
    reseau:     "#4A9B8E",
    pentest:    "#E8621A",
    pentesting: "#E8621A",
    web:        "#E8621A",
    hardening:  "#6B7A8D",
    sysadmin:   "#6B7A8D",
    linux:      "#6B7A8D",
    crypto:     "#B8860B",
    cryptography: "#B8860B",
    forensics:  "#B8860B",
};

const COVER_PALETTE = ["#C5A880", "#7ED3C1", "#F3A390", "#E8621A", "#795238", "#5A6B7C"];

function getDomainAccent(domain?: string, defaultColor = "#1B6CA8"): string {
    if (!domain) return defaultColor;
    const key = domain.toLowerCase().replace(/[^a-z]/g, "");
    for (const [kw, color] of Object.entries(DOMAIN_ACCENT)) {
        if (key.includes(kw)) return color;
    }
    return defaultColor;
}

export const ReportDocument = ({ report, settings }: { report: Report, settings?: SiteSettings }) => {
    const reportDate = report.createdAt ? (typeof report.createdAt === 'object' && 'toDate' in report.createdAt ? (report.createdAt as any).toDate() : new Date(report.createdAt as any)).toLocaleDateString() : "N/A";
    const dynamicAccent = getDomainAccent(report.domain, settings?.theme?.primaryAccent);
    const headerBg = settings?.theme?.sectionHeaderBg || "#0d1528";

    const logoUrl = typeof window !== 'undefined' ? window.location.origin + "/Logo_EFREI_New.png" : "/Logo_EFREI_New.png";
    const abbaLogoUrl = typeof window !== 'undefined' ? window.location.origin + "/Logo%20ABBA.jpg" : "/Logo ABBA.jpg";
    const sketchUrl = typeof window !== 'undefined' ? window.location.origin + "/efrei_campus_sketch.jpg" : "/efrei_campus_sketch.jpg";

    return (
        <Document>
            <Page size="A4" style={styles.coverPage}>
                {/* Blue Top Accent Line */}
                <View style={[styles.coverTopBar, { backgroundColor: dynamicAccent }]} />
                
                {/* Top Section */}
                <View style={{ alignItems: "center", width: "100%" }}>
                    <View style={styles.coverLogoContainer}>
                        <View style={styles.coverLogoEfreiWrapper}>
                            <Image src={logoUrl} style={styles.coverLogoEfrei} />
                        </View>
                        <View style={styles.coverLogoDivider} />
                        <View style={styles.coverLogoAbbaWrapper}>
                            <Image src={abbaLogoUrl} style={styles.coverLogoAbba} />
                        </View>
                    </View>
                </View>

                {/* Middle Section */}
                <View style={{ alignItems: "center", width: "100%" }}>
                    {/* Title and Separator Line */}
                    <View style={styles.coverTitleContainer}>
                        <Text style={[styles.coverTitle, { color: dynamicAccent }]}>{report.title}</Text>
                        <View style={styles.coverTitleUnderline} />
                    </View>

                    {/* Metadata details block */}
                    <View style={styles.coverDetailsContainer}>
                        <Text style={styles.coverDetailText}>
                            <Text style={styles.coverDetailLabel}>Formation : </Text>
                            <Text style={styles.coverDetailValue}>{report.subtitle || report.course || "Master 1 — Cybersécurité, Réseaux & Cloud"}</Text>
                        </Text>
                        <Text style={styles.coverDetailText}>
                            <Text style={styles.coverDetailLabel}>Groupe / Élève : </Text>
                            <Text style={styles.coverDetailValue}>{report.groupMembers && report.groupMembers.length > 0 ? report.groupMembers.join(", ") : "Massil ABBA"}</Text>
                        </Text>
                        <Text style={styles.coverDetailText}>
                            <Text style={styles.coverDetailLabel}>Date de rendu : </Text>
                            <Text style={styles.coverDetailValue}>{report.dateOverride || reportDate}</Text>
                        </Text>
                        {report.tutor && (
                            <Text style={styles.coverDetailText}>
                                <Text style={styles.coverDetailLabel}>Tuteur référent : </Text>
                                <Text style={styles.coverDetailValue}>{report.tutor}</Text>
                            </Text>
                        )}
                    </View>
                </View>

                {/* Bottom Section */}
                <View style={{ alignItems: "center", width: "100%" }}>
                    {/* Efrei Courtyard Campus Sketch */}
                    <View style={styles.coverSketchContainer}>
                        <Image src={sketchUrl} style={styles.coverSketch} />
                    </View>

                    {/* Colored Palette Blocks */}
                    <View style={styles.coverPaletteContainer}>
                        {COVER_PALETTE.map((color, idx) => (
                            <View key={idx} style={[styles.coverPaletteBlock, { backgroundColor: color }]} />
                        ))}
                    </View>

                    {/* Footer (Rendering date left, class name right) */}
                    <View style={styles.coverFooter}>
                        <Text style={styles.coverFooterText}>Date de rendu : {report.dateOverride || reportDate}</Text>
                        <Text style={styles.coverFooterText}>{report.course || "M1 CSC1"}</Text>
                    </View>
                </View>
            </Page>
            <Page size="A4" style={styles.page} wrap>
                {report.sections?.map((section, idx) => (
                    <View key={section.id} style={{ marginBottom: 12 }}>
                        <View style={[styles.sectionHeader, { backgroundColor: headerBg }]} wrap={false}>
                            <View style={styles.sectionHeaderLeft}>
                                <Text style={styles.sectionPhase}>PHASE {idx + 1}</Text>
                                <View style={styles.sectionNumberRow}>
                                    <Text style={styles.sectionNumber}>0{idx + 1}</Text>
                                    <View style={{ marginLeft: 8, marginTop: 2 }}><PdfIcon name={section.icon || "Terminal"} color={dynamicAccent} /></View>
                                </View>
                            </View>
                            <View style={styles.sectionDivider} />
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>
                        {section.blocks?.map(block => {
                            if (block.type === 'text' && block.content && block.content !== "<p></p>") return <View key={block.id}>{parseHtmlToPdf(block.content)}</View>;
                            if ((block.type === 'image' || block.type === 'code') && block.content) return (
                                <View key={block.id} style={styles.preContainer} wrap={false}>
                                    <View style={styles.macHeader}>
                                        <View style={styles.macDotsContainer}><View style={styles.macDotRed} /><View style={styles.macDotYellow} /><View style={styles.macDotGreen} /></View>
                                        <Text style={styles.macLabel}>{block.filename || ""}</Text>
                                    </View>
                                    {block.type === 'image' ? <Image src={block.content} style={styles.imageContent} /> : <View style={styles.pre}><Text>{block.content}</Text></View>}
                                </View>
                            );
                            return null;
                        }) || (section.content ? parseHtmlToPdf(section.content) : <Text style={styles.p}>No content.</Text>)}
                    </View>
                ))}
                <View style={styles.footerContainer} fixed>
                    <Text style={styles.footerText}>{report.title}</Text>
                    <Text style={styles.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
                    <Text style={styles.footerText}>EFREI × ABBA</Text>
                </View>
            </Page>
        </Document>
    );
};
