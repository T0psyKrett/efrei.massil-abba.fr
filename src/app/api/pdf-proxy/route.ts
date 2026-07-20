import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const pdfUrl = searchParams.get("url");

    if (!pdfUrl) {
        return new NextResponse("Missing url parameter", { status: 400 });
    }

    try {
        // 1. Direct fetch attempt
        let response = await fetch(pdfUrl);

        // 2. If 401/403/404 on Cloudinary, try signed URLs
        if (!response.ok && pdfUrl.includes("cloudinary.com")) {
            const match = pdfUrl.match(/\/v\d+\/(.+)$/);
            if (match) {
                const fullPath = match[1];
                const cleanPath = fullPath.replace(/\.pdf$/i, "");

                // Try resource_type: "raw" with full path
                const signedRawUrl = cloudinary.url(fullPath, {
                    resource_type: "raw",
                    sign_url: true,
                    secure: true,
                });
                response = await fetch(signedRawUrl);

                // Try resource_type: "image" format pdf
                if (!response.ok) {
                    const signedImageUrl = cloudinary.url(cleanPath, {
                        resource_type: "image",
                        format: "pdf",
                        sign_url: true,
                        secure: true,
                    });
                    response = await fetch(signedImageUrl);
                }
            }
        }

        if (!response.ok) {
            return new NextResponse(`Failed to fetch PDF: ${response.status}`, { status: response.status });
        }

        const arrayBuffer = await response.arrayBuffer();
        return new NextResponse(arrayBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (err: any) {
        console.warn("PDF Proxy notice:", err);
        return new NextResponse(err.message || "Proxy error", { status: 500 });
    }
}
