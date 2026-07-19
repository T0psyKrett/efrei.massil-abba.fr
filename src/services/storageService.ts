export interface UploadProgressCallback {
    (progress: number): void;
}

export type ImportedFileType = "pdf" | "docx" | "md";

export function detectFileType(filename: string): ImportedFileType | null {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (ext === "docx") return "docx";
    if (ext === "md") return "md";
    return null;
}

export async function uploadFile(
    file: File,
    _path: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    // Upload via server-side Cloudinary route
    onProgress?.(10);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    onProgress?.(90);

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur d'envoi HTTP ${response.status}`);
    }

    const data = await response.json();
    onProgress?.(100);
    return data.url;
}

export async function deleteFile(_url: string): Promise<void> {
    // Deletion via Cloudinary would need a separate API call
    // For now, we skip deletion to avoid complexity
    console.warn("deleteFile: Cloudinary deletion not implemented yet");
}

export function generateStoragePath(
    projectId: string,
    filename: string,
    type: "files" | "imports" | "images" = "files"
): string {
    const timestamp = Date.now();
    const cleanProjectId = projectId && projectId.trim() ? projectId : "general";
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    return `projects/${cleanProjectId}/${type}/${timestamp}_${cleanFilename}`;
}
