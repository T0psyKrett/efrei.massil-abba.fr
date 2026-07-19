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

        // Check file size (50MB limit)
        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: "La taille du fichier dépasse la limite autorisée de 50 Mo" }, { status: 413 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename and add timestamp
        const originalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${Date.now()}_${originalName}`;

        // ─── 1. Primary Cloud Upload via Firebase Admin Storage ───
        try {
            if (process.env.FIREBASE_ADMIN_PRIVATE_KEY && process.env.FIREBASE_ADMIN_CLIENT_EMAIL) {
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
                    // Bucket ACL default read handles access
                }

                const fileUrl = `https://storage.googleapis.com/${bucketName}/uploads/${filename}`;
                return NextResponse.json({ url: fileUrl, filename: file.name }, { status: 200 });
            }
        } catch (adminErr) {
            console.warn("Firebase Admin Storage upload failed, attempting environment fallback:", adminErr);
        }

        // ─── 2. Local Disk Fallback (Only for local development environments) ───
        const isServerless = process.env.VERCEL === "1" || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NODE_ENV === "production";
        
        if (!isServerless) {
            try {
                const uploadDir = join(process.cwd(), "public", "uploads");
                if (!existsSync(uploadDir)) {
                    await mkdir(uploadDir, { recursive: true });
                }
                const filepath = join(uploadDir, filename);
                await writeFile(filepath, buffer);
                const fileUrl = `/uploads/${filename}`;
                return NextResponse.json({ url: fileUrl, filename: file.name }, { status: 200 });
            } catch (diskErr) {
                console.warn("Local disk write failed, switching to Data URI fallback:", diskErr);
            }
        }

        // ─── 3. Impervious Serverless Data URI Fallback ───
        // Converts binary buffer to data: URI — works 100% natively in PDFJS viewer without disk writes
        const mimeType = file.type || "application/pdf";
        const base64Data = buffer.toString("base64");
        const dataUrl = `data:${mimeType};base64,${base64Data}`;

        return NextResponse.json({ url: dataUrl, filename: file.name }, { status: 200 });
    } catch (error: any) {
        console.error("Upload route error:", error);
        return NextResponse.json({ error: error?.message || "Échec de l'envoi du fichier" }, { status: 500 });
    }
}
