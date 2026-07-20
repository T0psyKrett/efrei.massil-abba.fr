"use client";

import { useEffect, useRef, useState } from "react";
import { FileText, Loader2 } from "lucide-react";

interface PDFThumbnailProps {
    url: string;
    title?: string;
    className?: string;
}

export default function PDFThumbnail({ url, title, className = "" }: PDFThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let isMounted = true;
        let renderTask: any = null;

        async function renderPage1() {
            if (!url) return;
            setLoading(true);
            setError(false);

            try {
                const pdfjs = await import("pdfjs-dist");
                if (!pdfjs.GlobalWorkerOptions.workerSrc) {
                    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
                }

                let response = await fetch(url);
                if (!response.ok) {
                    const proxyUrl = `/api/pdf-proxy?url=${encodeURIComponent(url)}`;
                    response = await fetch(proxyUrl);
                }
                if (!response.ok) throw new Error("HTTP error " + response.status);
                const arrayBuffer = await response.arrayBuffer();

                const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                if (!isMounted) return;

                const page = await doc.getPage(1);
                if (!isMounted) return;

                const canvas = canvasRef.current;
                if (!canvas) return;

                const context = canvas.getContext("2d");
                if (!context) return;

                // Fit page 1 scale to thumbnail resolution (~320px width)
                const unscaledViewport = page.getViewport({ scale: 1.0 });
                const targetScale = 360 / unscaledViewport.width;
                const viewport = page.getViewport({ scale: targetScale });
                const dpr = window.devicePixelRatio || 1;

                canvas.width = Math.floor(viewport.width * dpr);
                canvas.height = Math.floor(viewport.height * dpr);
                canvas.style.width = "100%";
                canvas.style.height = "100%";

                context.scale(dpr, dpr);

                renderTask = page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                });

                await renderTask.promise;
                if (isMounted) setLoading(false);
            } catch (err) {
                if (isMounted) {
                    console.warn("PDF Thumbnail render notice:", err);
                    setError(true);
                    setLoading(false);
                }
            }
        }

        renderPage1();

        return () => {
            isMounted = false;
            if (renderTask) renderTask.cancel();
        };
    }, [url]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full w-full bg-[#112030] text-[#5c7d99] p-4 text-center">
                <FileText size={24} className="mb-1 text-[#3b9fd4]" />
                <span className="text-[11px] font-medium text-white truncate max-w-full">{title}</span>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full bg-[#0a1824] overflow-hidden ${className}`}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#112030] z-10">
                    <Loader2 size={22} className="animate-spin text-[#3b9fd4]" />
                </div>
            )}
            <canvas ref={canvasRef} className="block w-full h-full object-cover" />
        </div>
    );
}
