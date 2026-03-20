"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Image from "@tiptap/extension-image";
import {
    Heading1, Heading2, ImageIcon,
    Bold, Italic, UnderlineIcon, List, ListOrdered, Code
} from "lucide-react";
import { useRef } from "react";
import { uploadFile, generateStoragePath } from "@/services/storageService";

interface ReportSectionEditorProps {
    sectionId: string;
    placeholder: string;
    content: string;
    projectId: string;
    onChange: (sectionId: string, html: string) => void;
}

function ToolbarButton({
    active, onClick, children, title,
}: {
    active?: boolean; onClick: () => void; children: React.ReactNode; title: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors flex-shrink-0"
            style={{
                background: active ? "rgba(26,127,212,0.2)" : "transparent",
                color: active ? "#60b8ff" : "var(--text-secondary)",
            }}
        >
            {children}
        </button>
    );
}

export default function ReportSection({
    sectionId, placeholder, content, projectId, onChange,
}: ReportSectionEditorProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const editor = useEditor({
        extensions: [
            StarterKit.configure({ codeBlock: false }),
            Placeholder.configure({ placeholder }),
            Underline,
            Image.configure({
                inline: false,
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full my-4 border border-gray-700 mx-auto shadow-xl',
                },
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(sectionId, editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "ProseMirror focus:outline-none min-h-[160px]",
            },
        },
    });

    if (!editor) return null;

    const addImage = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editor) return;

        try {
            const path = generateStoragePath(projectId, file.name, "images");
            const url = await uploadFile(file, path);
            
            editor.chain().focus().setImage({ src: url }).run();
        } catch (error) {
            console.error("Image upload failed", error);
            alert("Failed to upload image.");
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="w-full">
            {/* Toolbar */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
            />
            <div
                className="px-4 py-2 flex items-center gap-1 flex-wrap rounded-t-xl"
                style={{ borderBottom: "1px solid var(--border-color)", background: "var(--bg-card)" }}
            >
                <ToolbarButton
                    title="Bold"
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                >
                    <Bold size={14} />
                </ToolbarButton>
                <ToolbarButton
                    title="Italic"
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                >
                    <Italic size={14} />
                </ToolbarButton>
                <ToolbarButton
                    title="Underline"
                    active={editor.isActive("underline")}
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                >
                    <UnderlineIcon size={14} />
                </ToolbarButton>
                <div className="w-px h-5 mx-1" style={{ background: "var(--border-color)" }} />
                <ToolbarButton
                    title="Heading 1"
                    active={editor.isActive("heading", { level: 1 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                >
                    <Heading1 size={14} />
                </ToolbarButton>
                <ToolbarButton
                    title="Heading 2"
                    active={editor.isActive("heading", { level: 2 })}
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                >
                    <Heading2 size={14} />
                </ToolbarButton>
                <div className="w-px h-5 mx-1" style={{ background: "var(--border-color)" }} />
                <ToolbarButton
                    title="Bullet list"
                    active={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                >
                    <List size={14} />
                </ToolbarButton>
                <ToolbarButton
                    title="Ordered list"
                    active={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                >
                    <ListOrdered size={14} />
                </ToolbarButton>
                <div className="w-px h-5 mx-1" style={{ background: "var(--border-color)" }} />
                <ToolbarButton
                    title="Code"
                    active={editor.isActive("code")}
                    onClick={() => editor.chain().focus().toggleCode().run()}
                >
                    <Code size={14} />
                </ToolbarButton>
                <ToolbarButton
                    title="Image"
                    onClick={addImage}
                >
                    <ImageIcon size={14} />
                </ToolbarButton>
            </div>

            {/* Editor area */}
            <div className="px-5 py-4 bg-[var(--bg-card)] rounded-b-xl">
                <EditorContent editor={editor} />
            </div>
        </div>
    );
}
