import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { getAdminStorage } from "@/services/firebaseAdmin";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // 1. Try Firebase Admin Storage (Works on Vercel if Firebase keys exist)
        try {
            if (process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
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
            }
        } catch (storageErr) {
            console.warn("Firebase Admin Storage upload skipped/failed:", storageErr);
        }

        // 2. Try Cloudinary (Works on Vercel with resource_type: 'raw' for PDFs)
        try {
            if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
                const isImage = file.type?.startsWith("image/");
                const resourceType = isImage ? "image" : "raw";

                const result = await new Promise<any>((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            resource_type: resourceType,
                            folder: "efrei-reports",
                            use_filename: true,
                            unique_filename: true,
                        },
                        (error, res) => {
                            if (error) reject(error);
                            else resolve(res);
                        }
                    );
                    uploadStream.end(buffer);
                });

                if (result && result.secure_url) {
                    return NextResponse.json({
                        url: result.secure_url,
                        filename: file.name,
                    }, { status: 200 });
                }
            }
        } catch (cloudErr) {
            console.warn("Cloudinary upload failed:", cloudErr);
        }

        // 3. Fallback for Local Dev (when filesystem is writable)
        try {
            const uploadsDir = path.join(process.cwd(), "public", "uploads");
            await fs.mkdir(uploadsDir, { recursive: true });

            const cleanFilename = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
            const filename = `${Date.now()}_${cleanFilename}`;
            const filePath = path.join(uploadsDir, filename);

            await fs.writeFile(filePath, buffer);

            return NextResponse.json({
                url: `/uploads/${filename}`,
                filename: file.name,
            }, { status: 200 });
        } catch (fsErr) {
            console.warn("Local filesystem write failed (serverless environment):", fsErr);
        }

        // 4. Ultimate fallback for Vercel if all cloud credentials are missing: Data URL (Base64)
        const base64 = buffer.toString("base64");
        const mimeType = file.type || "application/pdf";
        const dataUrl = `data:${mimeType};base64,${base64}`;

        return NextResponse.json({
            url: dataUrl,
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
