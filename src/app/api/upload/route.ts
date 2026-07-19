import { NextRequest, NextResponse } from "next/server";
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
        
        // Define upload directory
        const uploadDir = join(process.cwd(), "public", "uploads");

        // Create directory if it doesn't exist
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filepath = join(uploadDir, filename);

        // Write file to public/uploads
        await writeFile(filepath, buffer);

        // Return the public URL
        const fileUrl = `/uploads/${filename}`;
        
        return NextResponse.json({ url: fileUrl, filename: file.name }, { status: 200 });
    } catch (error: any) {
        console.error("Upload route error:", error);
        return NextResponse.json({ error: error?.message || "Échec de l'envoi du fichier" }, { status: 500 });
    }
}
