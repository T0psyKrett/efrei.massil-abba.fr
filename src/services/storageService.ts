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
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
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

export async function deleteFile(url: string): Promise<void> {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
}

export function generateStoragePath(
    projectId: string,
    filename: string,
    type: "files" | "imports" | "images" = "files"
): string {
    const timestamp = Date.now();
    return `projects/${projectId}/${type}/${timestamp}_${filename}`;
}
