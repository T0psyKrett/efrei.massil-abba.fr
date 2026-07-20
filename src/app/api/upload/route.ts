import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getAdminStorage } from "@/services/firebaseAdmin";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
        }

        if (file.size > 50 * 1024 * 1024) {
            return NextResponse.json({ error: "Fichier trop volumineux (max 50 Mo)" }, { status: 413 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Try Firebase Admin Storage first for production/Vercel serverless deployment
        try {
            const bucket = getAdminStorage().bucket();
            const cleanFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
            const filePath = `reports/${Date.now()}_${cleanFilename}`;
            const fileRef = bucket.file(filePath);

            await fileRef.save(buffer, {
                metadata: {
                    contentType: file.type || "application/pdf",
                },
                resumable: false,
            });

            const [signedUrl] = await fileRef.getSignedUrl({
                action: "read",
                expires: "01-01-2099",
            });

            return NextResponse.json({
                url: signedUrl,
                filename: file.name,
            }, { status: 200 });
        } catch (storageErr) {
            console.warn("Firebase Admin Storage upload skipped/failed, fallback to local uploads:", storageErr);
        }

        // Local public storage fallback (e.g. for dev / Node server)
        const uploadsDir = path.join(process.cwd(), "public", "uploads");
        await fs.mkdir(uploadsDir, { recursive: true });

        const cleanFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const filename = `${Date.now()}_${cleanFilename}`;
        const filePath = path.join(uploadsDir, filename);

        await fs.writeFile(filePath, buffer);

        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({
            url: fileUrl,
            filename: file.name,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Upload route error:", error);
        return NextResponse.json(
            { error: error?.message || "Échec de l'envoi du fichier" },
            { status: 500 }
        );
    }
}
