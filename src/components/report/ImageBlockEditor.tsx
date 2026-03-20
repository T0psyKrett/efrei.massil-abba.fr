import { useState, useRef } from "react";
import { ImageIcon, UploadCloud, Loader2 } from "lucide-react";
import { uploadFile, generateStoragePath } from "@/services/storageService";

export default function ImageBlockEditor({ content, projectId, onChange }: { content: string, projectId: string, onChange: (url: string, filename?: string) => void }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const path = generateStoragePath(projectId, file.name, "images");
            const url = await uploadFile(file, path);
            
            onChange(url, file.name);
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (content) {
        return (
            <div className="w-full h-full flex flex-col group p-2">
                <div className="relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 shadow-md">
                    <img 
                        src={content} 
                        alt="Block image" 
                        className="w-full h-auto object-contain block m-0 transition-transform duration-300 group-hover:scale-[1.02]" 
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onChange(""); }} 
                            className="bg-red-500 hover:bg-red-600 text-white text-[12px] font-bold py-2 px-4 rounded-lg shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        >
                            Remove Image
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div 
            className={`p-8 flex flex-col items-center justify-center border-2 border-dashed rounded-xl m-4 transition-colors ${uploading ? 'border-blue-500 bg-blue-50/10' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#1a1a2a] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#232338]'}`}
            onClick={() => !uploading && fileInputRef.current?.click()}
        >
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
                disabled={uploading}
            />
            {uploading ? (
                <>
                    <Loader2 size={32} className="text-blue-500 mb-3 animate-spin" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 tracking-wide mt-1">Uploading image...</p>
                </>
            ) : (
                <>
                    <UploadCloud size={32} className="text-gray-400 mb-3" />
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-1 tracking-wide">Click to upload an image</p>
                    <p className="text-xs text-gray-500 mt-1">Supports JPG, PNG, GIF</p>
                </>
            )}
        </div>
    );
}
