"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    Download,
    ExternalLink,
    Search,
    X,
    RotateCw,
    Moon,
    Sun,
    AlertTriangle,
    Loader2,
    FileText,
    ChevronUp,
    ChevronDown,
} from "lucide-react";
import type * as PDFJSType from "pdfjs-dist";

export interface PDFViewerProps {
    url: string | null | undefined;
    title?: string;
    onClose?: () => void;
    className?: string;
}

interface SearchMatch {
    pageNumber: number;
    matchIndex: number;
}

export default function PDFViewer({
    url,
    title = "Rapport PDF",
    onClose,
    className = "",
}: PDFViewerProps) {
    // PDF Document state
    const [pdfDoc, setPdfDoc]               = useState<PDFJSType.PDFDocumentProxy | null>(null);
    const [numPages, setNumPages]           = useState<number>(0);
    const [currentPage, setCurrentPage]     = useState<number>(1);
    const [scale, setScale]                 = useState<number>(1.0);
    const [rotation, setRotation]           = useState<number>(0);
    const [fitToWidth, setFitToWidth]       = useState<boolean>(true);
    const [nightMode, setNightMode]         = useState<boolean>(false);
    
    // UI & Loading state
    const [loading, setLoading]             = useState<boolean>(true);
    const [loadingProgress, setLoadingProgress] = useState<number>(0);
    const [error, setError]                 = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen]   = useState<boolean>(false);

    // Search state
    const [showSearch, setShowSearch]       = useState<boolean>(false);
    const [searchTerm, setSearchTerm]       = useState<string>("");
    const [searchResults, setSearchResults] = useState<SearchMatch[]>([]);
    const [currentMatchIdx, setCurrentMatchIdx] = useState<number>(0);
    const [isSearching, setIsSearching]     = useState<boolean>(false);

    // Refs
    const containerRef  = useRef<HTMLDivElement>(null);
    const canvasRef     = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<PDFJSType.RenderTask | null>(null);
    const pageInputRef  = useRef<HTMLInputElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // ── Load PDF Document ──────────────────────────────────────────────────────
    const loadPdf = useCallback(async () => {
        if (!url) {
            setError("Aucune URL de fichier PDF fournie.");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        setLoadingProgress(10);

        try {
            // Dynamically import pdfjs-dist on client to avoid DOMMatrix Node.js SSR error
            const pdfjs = await import("pdfjs-dist");
            if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
            }

            // Fetch arrayBuffer for maximum cross-origin / Firebase token reliability
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Impossible de télécharger le fichier PDF (${response.status} ${response.statusText})`);
            }

            setLoadingProgress(40);
            const arrayBuffer = await response.arrayBuffer();
            setLoadingProgress(70);

            const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
            loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
                if (progress.total > 0) {
                    const percent = Math.round((progress.loaded / progress.total) * 100);
                    setLoadingProgress(Math.min(90, percent));
                }
            };

            const doc = await loadingTask.promise;
            setPdfDoc(doc);
            setNumPages(doc.numPages);
            setCurrentPage(1);
            setLoadingProgress(100);
            setLoading(false);
        } catch (err: any) {
            console.error("Failed to load PDF:", err);
            setError(err?.message || "Le document PDF n'a pas pu être chargé. Il est peut-être corrompu ou protégé.");
            setLoading(false);
        }
    }, [url]);

    useEffect(() => {
        loadPdf();
    }, [loadPdf]);

    // ── Render Page on Canvas ──────────────────────────────────────────────────
    const renderPage = useCallback(async () => {
        if (!pdfDoc || !canvasRef.current || currentPage < 1 || currentPage > numPages) return;

        try {
            // Cancel previous active render task if user zooms or changes page quickly
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
                renderTaskRef.current = null;
            }

            const page = await pdfDoc.getPage(currentPage);
            const canvas = canvasRef.current;
            const context = canvas.getContext("2d");
            if (!context) return;

            // Calculate auto scale for "Fit to width" if enabled
            let targetScale = scale;
            if (fitToWidth && containerRef.current) {
                const containerWidth = containerRef.current.clientWidth - 48; // padding space
                const viewportUnscaled = page.getViewport({ scale: 1.0, rotation });
                if (containerWidth > 0 && viewportUnscaled.width > 0) {
                    targetScale = Math.min(Math.max(containerWidth / viewportUnscaled.width, 0.5), 2.5);
                }
            }

            const viewport = page.getViewport({ scale: targetScale, rotation });
            const dpr = window.devicePixelRatio || 1;

            // Canvas display dimensions
            canvas.width = Math.floor(viewport.width * dpr);
            canvas.height = Math.floor(viewport.height * dpr);
            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;

            // Normalize coordinate system for retina display
            context.scale(dpr, dpr);

            const renderContext = {
                canvasContext: context,
                viewport: viewport,
                canvas: canvas,
            };

            const renderTask = page.render(renderContext);
            renderTaskRef.current = renderTask;
            await renderTask.promise;
            renderTaskRef.current = null;
        } catch (err: any) {
            if (err?.name !== "RenderingCancelledException") {
                console.error("Error rendering PDF page:", err);
            }
        }
    }, [pdfDoc, currentPage, numPages, scale, rotation, fitToWidth]);

    useEffect(() => {
        renderPage();
    }, [renderPage]);

    // Re-render on window resize if fitToWidth is enabled
    useEffect(() => {
        if (!fitToWidth) return;
        const handleResize = () => renderPage();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [fitToWidth, renderPage]);

    // ── Text Search Feature ────────────────────────────────────────────────────
    const performSearch = async (query: string) => {
        if (!pdfDoc || !query.trim()) {
            setSearchResults([]);
            setCurrentMatchIdx(0);
            return;
        }

        setIsSearching(true);
        const matches: SearchMatch[] = [];
        const cleanQuery = query.toLowerCase();

        try {
            for (let i = 1; i <= pdfDoc.numPages; i++) {
                const page = await pdfDoc.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items
                    .map((item: any) => item.str)
                    .join(" ")
                    .toLowerCase();

                let pos = pageText.indexOf(cleanQuery);
                let matchIdxOnPage = 0;
                while (pos !== -1) {
                    matches.push({ pageNumber: i, matchIndex: matchIdxOnPage });
                    matchIdxOnPage++;
                    pos = pageText.indexOf(cleanQuery, pos + cleanQuery.length);
                }
            }

            setSearchResults(matches);
            setCurrentMatchIdx(0);

            if (matches.length > 0) {
                setCurrentPage(matches[0].pageNumber);
            }
        } catch (err) {
            console.error("Error searching PDF text:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performSearch(searchTerm);
    };

    const navigateMatch = (direction: "next" | "prev") => {
        if (searchResults.length === 0) return;
        let nextIdx = direction === "next" ? currentMatchIdx + 1 : currentMatchIdx - 1;
        if (nextIdx >= searchResults.length) nextIdx = 0;
        if (nextIdx < 0) nextIdx = searchResults.length - 1;

        setCurrentMatchIdx(nextIdx);
        setCurrentPage(searchResults[nextIdx].pageNumber);
    };

    // ── Keyboard Shortcuts & Accessibility ─────────────────────────────────────
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in text inputs
            if (["INPUT", "TEXTAREA", "SELECT"].includes((e.target as HTMLElement)?.tagName)) {
                return;
            }

            switch (e.key) {
                case "ArrowLeft":
                case "PageUp":
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                    break;
                case "ArrowRight":
                case "PageDown":
                case " ":
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(numPages, p + 1));
                    break;
                case "+":
                case "=":
                    e.preventDefault();
                    setFitToWidth(false);
                    setScale((s) => Math.min(3.0, s + 0.15));
                    break;
                case "-":
                    e.preventDefault();
                    setFitToWidth(false);
                    setScale((s) => Math.max(0.5, s - 0.15));
                    break;
                case "0":
                    e.preventDefault();
                    setFitToWidth(true);
                    break;
                case "f":
                case "F":
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case "Escape":
                    if (isFullscreen) {
                        toggleFullscreen();
                    } else if (onClose) {
                        onClose();
                    }
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [numPages, isFullscreen, onClose]);

    // ── Fullscreen Toggle ──────────────────────────────────────────────────────
    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
        }
    };

    // Listen to fullscreen changes (e.g. Esc pressed natively)
    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", handler);
        return () => document.removeEventListener("fullscreenchange", handler);
    }, []);

    // Focus search input when search bar opens
    useEffect(() => {
        if (showSearch) searchInputRef.current?.focus();
    }, [showSearch]);

    // ── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <div
            ref={containerRef}
            className={`pdf-viewer-root flex flex-col h-full w-full bg-[#0D1B2A] text-[#E8EDF2] select-none relative overflow-hidden ${className}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* ── TOP TOOLBAR ── */}
            <div
                className="pdf-toolbar flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-b border-[#1a3049] bg-[#0f2035]/95 backdrop-blur-md sticky top-0 z-30 flex-shrink-0"
                style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
            >
                {/* Left: Document Title & Page Nav */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#3b9fd4] truncate max-w-[200px] sm:max-w-[280px]">
                        <FileText size={15} className="flex-shrink-0" aria-hidden="true" />
                        <span className="truncate" title={title}>{title}</span>
                    </div>

                    {!loading && !error && numPages > 0 && (
                        <div className="flex items-center gap-1 bg-[#112030] border border-[#1a3049] rounded-lg px-1.5 py-1 text-xs">
                            <button
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage <= 1}
                                aria-label="Page précédente"
                                className="p-1 hover:bg-[#1b6ca8]/30 rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft size={15} />
                            </button>

                            <div className="flex items-center gap-1 px-1">
                                <input
                                    ref={pageInputRef}
                                    type="number"
                                    min={1}
                                    max={numPages}
                                    value={currentPage}
                                    onChange={(e) => {
                                        const val = parseInt(e.target.value, 10);
                                        if (val >= 1 && val <= numPages) setCurrentPage(val);
                                    }}
                                    className="w-10 text-center bg-[#0D1B2A] border border-[#204060] rounded text-white font-mono text-xs py-0.5 outline-none focus:border-[#3b9fd4]"
                                    aria-label="Numéro de page"
                                />
                                <span className="text-[#5c7d99]">/</span>
                                <span className="font-mono text-[#9ab3c8]">{numPages}</span>
                            </div>

                            <button
                                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                                disabled={currentPage >= numPages}
                                aria-label="Page suivante"
                                className="p-1 hover:bg-[#1b6ca8]/30 rounded transition disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronRight size={15} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Controls & Actions */}
                {!loading && !error && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Zoom Controls */}
                        <div className="hidden sm:flex items-center gap-1 bg-[#112030] border border-[#1a3049] rounded-lg p-1 text-xs">
                            <button
                                onClick={() => {
                                    setFitToWidth(false);
                                    setScale((s) => Math.max(0.5, s - 0.15));
                                }}
                                aria-label="Zoom arrière"
                                className="p-1 hover:bg-[#1b6ca8]/30 rounded transition text-[#9ab3c8] hover:text-white"
                                title="Zoom arrière (-)"
                            >
                                <ZoomOut size={14} />
                            </button>

                            <span className="text-[11px] font-mono w-12 text-center text-[#3b9fd4]">
                                {fitToWidth ? "Auto" : `${Math.round(scale * 100)}%`}
                            </span>

                            <button
                                onClick={() => {
                                    setFitToWidth(false);
                                    setScale((s) => Math.min(3.0, s + 0.15));
                                }}
                                aria-label="Zoom avant"
                                className="p-1 hover:bg-[#1b6ca8]/30 rounded transition text-[#9ab3c8] hover:text-white"
                                title="Zoom avant (+)"
                            >
                                <ZoomIn size={14} />
                            </button>

                            <button
                                onClick={() => setFitToWidth((f) => !f)}
                                className={`px-2 py-0.5 text-[10px] font-medium rounded transition ${
                                    fitToWidth
                                        ? "bg-[#1b6ca8] text-white"
                                        : "text-[#5c7d99] hover:text-[#9ab3c8] hover:bg-white/5"
                                }`}
                                title="Ajuster à la largeur (0)"
                            >
                                Ajuster
                            </button>
                        </div>

                        {/* Rotate button */}
                        <button
                            onClick={() => setRotation((r) => (r + 90) % 360)}
                            className="p-1.5 bg-[#112030] border border-[#1a3049] rounded-lg hover:bg-[#1b6ca8]/20 transition text-[#9ab3c8] hover:text-white"
                            aria-label="Faire pivoter"
                            title="Pivoter de 90°"
                        >
                            <RotateCw size={14} />
                        </button>

                        {/* Search Toggle */}
                        <button
                            onClick={() => setShowSearch((s) => !s)}
                            className={`p-1.5 border rounded-lg transition ${
                                showSearch
                                    ? "bg-[#1b6ca8] border-[#3b9fd4] text-white"
                                    : "bg-[#112030] border-[#1a3049] text-[#9ab3c8] hover:text-white hover:bg-[#1b6ca8]/20"
                            }`}
                            aria-label="Rechercher du texte"
                            title="Rechercher du texte"
                        >
                            <Search size={14} />
                        </button>

                        {/* Night Mode Toggle */}
                        <button
                            onClick={() => setNightMode((n) => !n)}
                            className={`p-1.5 border rounded-lg transition ${
                                nightMode
                                    ? "bg-[#1b6ca8] border-[#3b9fd4] text-[#fcd34d]"
                                    : "bg-[#112030] border-[#1a3049] text-[#9ab3c8] hover:text-white hover:bg-[#1b6ca8]/20"
                            }`}
                            aria-label="Basculer le mode lecture nuit"
                            title={nightMode ? "Mode couleur originale" : "Mode lecture nuit (inversion)"}
                        >
                            {nightMode ? <Sun size={14} /> : <Moon size={14} />}
                        </button>

                        {/* Download Original */}
                        {url && (
                            <a
                                href={url}
                                download={`${title.replace(/[^a-z0-9_-]/gi, "_")}.pdf`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#1b6ca8]/40 bg-[#1b6ca8]/15 text-[#3b9fd4] hover:bg-[#1b6ca8]/30 transition"
                                title="Télécharger le PDF original"
                            >
                                <Download size={13} />
                                Télécharger
                            </a>
                        )}

                        {/* Open in external tab */}
                        {url && (
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-[#112030] border border-[#1a3049] rounded-lg hover:bg-[#1b6ca8]/20 transition text-[#9ab3c8] hover:text-white"
                                aria-label="Ouvrir dans un nouvel onglet"
                                title="Ouvrir dans un nouvel onglet"
                            >
                                <ExternalLink size={14} />
                            </a>
                        )}

                        {/* Fullscreen Toggle */}
                        <button
                            onClick={toggleFullscreen}
                            className="p-1.5 bg-[#112030] border border-[#1a3049] rounded-lg hover:bg-[#1b6ca8]/20 transition text-[#9ab3c8] hover:text-white"
                            aria-label="Basculer le plein écran (F)"
                            title="Plein écran (F)"
                        >
                            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>

                        {/* Close Modal Button */}
                        {onClose && (
                            <button
                                onClick={onClose}
                                className="p-1.5 bg-[#112030] border border-red-500/30 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition ml-1"
                                aria-label="Fermer la visionneuse"
                                title="Fermer (Échap)"
                            >
                                <X size={15} />
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* ── SEARCH BAR SUBPANEL ── */}
            {showSearch && !loading && !error && (
                <div className="flex items-center gap-3 px-4 py-2 bg-[#112030] border-b border-[#1a3049] z-20 animate-in slide-in-from-top duration-150">
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Rechercher dans le document…"
                                className="w-full bg-[#0D1B2A] border border-[#204060] rounded-lg px-3 py-1 text-xs text-white placeholder-[#5c7d99] outline-none focus:border-[#3b9fd4]"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isSearching || !searchTerm.trim()}
                            className="px-3 py-1 bg-[#1b6ca8] hover:bg-[#3b9fd4] text-white text-xs font-semibold rounded-lg transition disabled:opacity-40"
                        >
                            {isSearching ? <Loader2 size={13} className="animate-spin" /> : "Chercher"}
                        </button>
                    </form>

                    {/* Search Results Navigation */}
                    {searchResults.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-[#9ab3c8]">
                            <span>
                                <strong className="text-[#3b9fd4]">{currentMatchIdx + 1}</strong> sur {searchResults.length} occurrence(s)
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => navigateMatch("prev")}
                                    className="p-1 hover:bg-white/10 rounded transition"
                                    title="Occurrence précédente"
                                >
                                    <ChevronUp size={14} />
                                </button>
                                <button
                                    onClick={() => navigateMatch("next")}
                                    className="p-1 hover:bg-white/10 rounded transition"
                                    title="Occurrence suivante"
                                >
                                    <ChevronDown size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                    {searchTerm && searchResults.length === 0 && !isSearching && (
                        <span className="text-xs text-[#5c7d99]">Aucun résultat trouvé.</span>
                    )}

                    <button
                        onClick={() => {
                            setShowSearch(false);
                            setSearchTerm("");
                            setSearchResults([]);
                        }}
                        className="text-[#5c7d99] hover:text-white p-1 ml-auto"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ── MAIN DOCUMENT VIEWPORT ── */}
            <div
                className="pdf-viewport flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start relative bg-[#0a1824]"
                style={{
                    backgroundImage: "radial-gradient(circle, rgba(59, 159, 212, 0.08) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                }}
            >
                {/* ── Loading Spinner ── */}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="relative flex items-center justify-center">
                            <Loader2 size={42} className="animate-spin text-[#3b9fd4]" />
                            <FileText size={18} className="absolute text-[#1b6ca8]" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-[#E8EDF2]">Chargement du document PDF…</p>
                            <p className="text-xs text-[#5c7d99] mt-1 font-mono">{loadingProgress}%</p>
                        </div>
                        <div className="w-48 h-1.5 bg-[#112030] rounded-full overflow-hidden border border-[#1a3049]">
                            <div
                                className="h-full bg-gradient-to-r from-[#1b6ca8] to-[#3b9fd4] transition-all duration-300"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* ── Error Fallback Card ── */}
                {error && (
                    <div className="max-w-md w-full my-auto p-6 rounded-2xl bg-[#112030] border border-red-500/30 text-center shadow-2xl flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white mb-1.5">Erreur d&apos;affichage du PDF</h3>
                            <p className="text-xs text-[#9ab3c8] leading-relaxed">{error}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 w-full">
                            <button
                                onClick={loadPdf}
                                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#1b6ca8] text-white hover:bg-[#3b9fd4] transition"
                            >
                                Réessayer
                            </button>
                            {url && (
                                <a
                                    href={url}
                                    download
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-[#1a3049] bg-[#0D1B2A] text-[#3b9fd4] hover:bg-[#112030] transition text-center"
                                >
                                    Télécharger direct
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* ── PDF Page Canvas Container ── */}
                {!loading && !error && (
                    <div
                        className={`pdf-canvas-wrapper relative transition-all duration-200 shadow-[0_20px_60px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden border border-[#1a3049]/60 ${
                            nightMode ? "invert contrast-125 brightness-90 hue-rotate-180" : ""
                        }`}
                        style={{ background: "#ffffff" }}
                    >
                        <canvas ref={canvasRef} className="block mx-auto max-w-full" />
                    </div>
                )}
            </div>

            {/* ── BOTTOM MOBILE CONTROLS BAR ── */}
            {!loading && !error && numPages > 0 && (
                <div className="sm:hidden flex items-center justify-between px-4 py-2 bg-[#0f2035] border-t border-[#1a3049] text-xs z-30">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="px-3 py-1.5 bg-[#112030] rounded-lg border border-[#1a3049] text-[#3b9fd4] disabled:opacity-30"
                    >
                        Précédent
                    </button>
                    <span className="font-mono text-[#9ab3c8]">
                        {currentPage} / {numPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                        disabled={currentPage >= numPages}
                        className="px-3 py-1.5 bg-[#112030] rounded-lg border border-[#1a3049] text-[#3b9fd4] disabled:opacity-30"
                    >
                        Suivant
                    </button>
                </div>
            )}
        </div>
    );
}
