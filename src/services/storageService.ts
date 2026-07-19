import { storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

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
    path: string,
    onProgress?: UploadProgressCallback
): Promise<string> {
    // Attempt client-side Firebase Storage upload first
    try {
        if (storage) {
            const storageRef = ref(storage, path);
            const task = uploadBytesResumable(storageRef, file);

            return await new Promise<string>((resolve, reject) => {
                task.on(
                    "state_changed",
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress?.(progress);
                    },
                    (error) => reject(error),
                    async () => {
                        const url = await getDownloadURL(task.snapshot.ref);
                        resolve(url);
                    }
                );
            });
        }
    } catch (firebaseErr) {
        console.warn("Client-side Firebase Storage upload failed or unauthorized. Falling back to /api/upload:", firebaseErr);
    }

    // Failover to /api/upload endpoint (saves to /public/uploads/)
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur d'envoi HTTP ${response.status}`);
    }

    const data = await response.json();
    onProgress?.(100);
    return data.url;
}

export async function deleteFile(url: string): Promise<void> {
    try {
        if (storage && url.includes("firebasestorage")) {
            const fileRef = ref(storage, url);
            await deleteObject(fileRef);
        }
    } catch (err) {
        console.warn("Failed to delete object from storage:", err);
    }
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
