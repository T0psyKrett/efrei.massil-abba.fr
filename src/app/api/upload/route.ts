import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const maxDuration = 60;

// Configure Cloudinary with env vars
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        // Upload to Cloudinary as raw file (supports PDF, DOCX, etc.)
        const result = await new Promise<any>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    resource_type: "raw",       // required for PDF/non-image files
                    folder: "efrei-reports",
                    use_filename: true,
                    unique_filename: true,
                    overwrite: false,
                    access_mode: "public",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(buffer);
        });

        return NextResponse.json({
            url: result.secure_url,
            filename: file.name,
            public_id: result.public_id,
        }, { status: 200 });

    } catch (error: any) {
        console.error("Cloudinary upload error:", error);
        return NextResponse.json(
            { error: error?.message || "Échec de l'envoi du fichier vers Cloudinary" },
            { status: 500 }
        );
    }
}
