import { NextRequest, NextResponse } from "next/server";
import { getAdminStorage } from "@/services/firebaseAdmin";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const maxDuration = 60; // 60s timeout for large uploads

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
        }

        // Check file size (50MB limit for large multi-page PDFs)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: "La taille du fichier dépasse la limite autorisée de 50 Mo" }, { status: 413 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and add timestamp
        const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${Date.now()}_${originalName}`;

        // 1. Primary Cloud Upload via Firebase Admin Storage (Works on Vercel Serverless without EROFS!)
        try {
            const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "site-efreimassilabba.firebasestorage.app";
            const storage = getAdminStorage();
            const bucket = storage.bucket(bucketName);
            const fileRef = bucket.file(`uploads/${filename}`);

            await fileRef.save(buffer, {
                metadata: {
                    contentType: file.type || "application/pdf",
                },
                public: true,
                resumable: false,
            });

            try {
                await fileRef.makePublic();
            } catch (pubErr) {
                // Ignore if bucket permissions already grant public read
            }

            // Public direct download URL
            const fileUrl = `https://storage.googleapis.com/${bucketName}/uploads/${filename}`;
            return NextResponse.json({ url: fileUrl, filename: file.name }, { status: 200 });
        } catch (adminErr) {
            console.warn("Firebase Admin Storage upload failed, attempting local fallback:", adminErr);
        }

        // 2. Local fallback (For local development environments with writable disk)
        const uploadDir = join(process.cwd(), "public", "uploads");
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${filename}`;
        return NextResponse.json({ url: fileUrl, filename: file.name }, { status: 200 });
    } catch (error: any) {
        console.error("Upload route error:", error);
        return NextResponse.json({ error: error?.message || "Échec de l'envoi du fichier" }, { status: 500 });
    }
}
