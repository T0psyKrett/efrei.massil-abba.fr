import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp,
    setDoc,
    onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import DOMPurify from "isomorphic-dompurify";

// ─── Real-time Listeners ──────────────────────────────────
export function subscribeToProjects(callback: (projects: Project[]) => void) {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        const projects = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
        callback(projects);
    });
}

export function subscribeToReports(callback: (reports: Report[]) => void) {
    const q = query(collection(db, "reports"), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
        const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
        callback(reports);
    });
}

// ─── Sanitization Helpers ─────────────────────────────────
const sanitizeString = (str: string, maxLength: number) => {
    if (!str) return "";
    // Strip HTML tags for simple text fields
    const stripped = str.replace(/<[^>]*>?/gm, "").trim();
    return stripped.slice(0, maxLength);
};

const sanitizeHTML = (html: string) => {
    if (!html) return "";
    return DOMPurify.sanitize(html);
};

const sanitizeTags = (tags: string[]) => {
    if (!tags) return [];
    return tags.slice(0, 10).map(t => sanitizeString(t, 50));
};

// ─── Types ────────────────────────────────────────────────
export interface Project {
    id?: string;
    title: string;
    description: string;
    course: string;
    technologies: string[];
    tags: string[];
    files: string[]; // Storage URLs
    reportId?: string;
    published?: boolean;
    status?: string;
    createdAt?: Timestamp;
    updatedAt?: Timestamp;
}

export type BlockType = "text" | "image" | "code";

export interface ReportBlock {
    id: string;
    type: BlockType;
    content: string; // HTML for text, URL for image, Raw text for code
    filename?: string; // Original filename for images/captures
}

export interface ReportSection {
    id: string;
    title: string;
    placeholder: string;
    content: string; // Legacy HTML from TipTap
    icon?: string;
    blocks?: ReportBlock[];
}

export interface Report {
    id?: string;
    projectId: string;
    title: string;
    course: string;
    year?: string;
    sections: ReportSection[];
    type: "generated" | "imported";
    importedFileUrl?: string;
    importedFileType?: "pdf" | "docx" | "md";
    createdAt?: Timestamp;
    updatedAt?: Timestamp;

    // Cover page custom fields
    subtitle?: string;
    categoryLabel?: string;
    isConfidential?: boolean;
    isInternal?: boolean;
    version?: string;
    dateOverride?: string;
    domain?: string;
    ips?: { label: string; ip: string; color: string }[];
    published?: boolean;
}

// ─── Default Report Sections ──────────────────────────────
export const DEFAULT_REPORT_SECTIONS: Omit<ReportSection, "content">[] = [
    { id: "title", title: "Title", placeholder: "Enter the report title and a brief abstract." },
    { id: "context", title: "Context", placeholder: "Describe the environment and the problem addressed in this project." },
    { id: "objectives", title: "Objectives", placeholder: "Explain the goals of this project and what you aim to demonstrate." },
    { id: "architecture", title: "Architecture", placeholder: "Describe the infrastructure used. Include diagrams if necessary." },
    { id: "implementation", title: "Implementation", placeholder: "Detail the technical steps taken during implementation." },
    { id: "security", title: "Security Considerations", placeholder: "Discuss security measures, vulnerabilities found, and mitigations applied." },
    { id: "results", title: "Results", placeholder: "Present your findings, metrics, and outcomes." },
    { id: "conclusion", title: "Conclusion", placeholder: "Summarize the project and discuss potential improvements or next steps." },
];

// ─── Projects ────────────────────────────────────────────
export async function getProjects(): Promise<Project[]> {
    const snap = await getDocs(query(collection(db, "projects"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Project));
}

export async function getProject(id: string): Promise<Project | null> {
    const snap = await getDoc(doc(db, "projects", id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Project) : null;
}

export async function createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const sanitized = {
        ...data,
        title: sanitizeString(data.title, 200),
        description: sanitizeString(data.description, 2000),
        course: sanitizeString(data.course, 100),
        tags: sanitizeTags(data.tags),
        technologies: sanitizeTags(data.technologies),
    };
    const ref = await addDoc(collection(db, "projects"), { ...sanitized, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
    const sanitized: Partial<Project> = { ...data };
    if (data.title) sanitized.title = sanitizeString(data.title, 200);
    if (data.description) sanitized.description = sanitizeString(data.description, 2000);
    if (data.course) sanitized.course = sanitizeString(data.course, 100);
    if (data.tags) sanitized.tags = sanitizeTags(data.tags);
    if (data.technologies) sanitized.technologies = sanitizeTags(data.technologies);

    await updateDoc(doc(db, "projects", id), { ...sanitized, updatedAt: serverTimestamp() });
}

export async function deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, "projects", id));
}

export async function searchProjects(term: string): Promise<Project[]> {
    const all = await getProjects();
    const q = term.toLowerCase();
    return all.filter(
        (p) =>
            p.title.toLowerCase().includes(q) ||
            p.course.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q)) ||
            p.technologies.some((t) => t.toLowerCase().includes(q))
    );
}

// ─── Reports ─────────────────────────────────────────────
export async function getReports(): Promise<Report[]> {
    const snap = await getDocs(query(collection(db, "reports"), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}

export async function getProjectReports(projectId: string): Promise<Report[]> {
    const snap = await getDocs(query(collection(db, "reports"), where("projectId", "==", projectId)));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}

export async function getReport(id: string): Promise<Report | null> {
    const snap = await getDoc(doc(db, "reports", id));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Report) : null;
}

export async function createReport(data: Omit<Report, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const sanitized: any = {
        ...data,
        title: sanitizeString(data.title, 200),
        sections: data.sections.map(s => {
            const sanitizedSection: any = {
                ...s,
                title: sanitizeString(s.title, 200),
                content: sanitizeHTML(s.content),
            };
            if (s.blocks) {
                sanitizedSection.blocks = s.blocks.map(b => {
                    const blk: any = { ...b, content: b.type === "text" ? sanitizeHTML(b.content) : b.content };
                    if (blk.filename === undefined) delete blk.filename;
                    return blk;
                });
            }
            return sanitizedSection;
        })
    };
    if (data.subtitle) sanitized.subtitle = sanitizeString(data.subtitle, 500);
    else delete sanitized.subtitle;
    const ref = await addDoc(collection(db, "reports"), { ...sanitized, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
    return ref.id;
}

export async function updateReport(id: string, data: Partial<Report>): Promise<void> {
    const sanitized: Partial<Report> = { ...data };
    if (data.title) sanitized.title = sanitizeString(data.title, 200);
    if (data.subtitle) sanitized.subtitle = sanitizeString(data.subtitle, 500);
    if (data.sections) {
        sanitized.sections = data.sections.map(s => ({
            ...s,
            title: sanitizeString(s.title, 200),
            content: sanitizeHTML(s.content),
            blocks: s.blocks?.map(b => ({
                ...b,
                content: b.type === "text" ? sanitizeHTML(b.content) : b.content
            }))
        }));
    }

    await updateDoc(doc(db, "reports", id), { ...sanitized, updatedAt: serverTimestamp() });
}

export async function deleteReport(id: string): Promise<void> {
    await deleteDoc(doc(db, "reports", id));
}

// ─── Settings ────────────────────────────────────────────
export interface Course {
    id: string;
    name: string;
    description: string;
}

export interface SiteSettings {
    courses: Course[];
    theme: {
        primaryAccent: string;
        sectionHeaderBg: string;
        coverGradientStart: string;
        coverGradientEnd: string;
    };
}

export const DEFAULT_SETTINGS: SiteSettings = {
    courses: [
        { id: "1", name: "Pentesting", description: "" },
        { id: "2", name: "Network Architecture", description: "" },
        { id: "3", name: "Linux Administration", description: "" },
        { id: "4", name: "Cryptography", description: "" },
        { id: "5", name: "Web Security", description: "" },
        { id: "6", name: "Forensics", description: "" },
    ],
    theme: {
        primaryAccent: "#F97316",
        sectionHeaderBg: "#0d1528",
        coverGradientStart: "#0a0f1e",
        coverGradientEnd: "#0d1528",
    }
};

export async function getSettings(): Promise<SiteSettings> {
    const snap = await getDoc(doc(db, "settings", "global"));
    if (snap.exists()) {
        const data = snap.data() as Partial<SiteSettings>;
        return {
            courses: data.courses || DEFAULT_SETTINGS.courses,
            theme: { ...DEFAULT_SETTINGS.theme, ...data.theme }
        };
    }
    // Seed default settings on first load if they don't exist
    await setDoc(doc(db, "settings", "global"), DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
}

export async function updateSettings(data: Partial<SiteSettings>): Promise<void> {
    await setDoc(doc(db, "settings", "global"), data, { merge: true });
}

export async function addCourse(name: string): Promise<Course> {
    const settings = await getSettings();
    const newCourse: Course = {
        id: Math.random().toString(36).substring(2, 9),
        name: name,
        description: ""
    };
    
    await updateSettings({
        courses: [...settings.courses, newCourse]
    });
    
    return newCourse;
}

export async function deleteProjectWithReports(projectId: string): Promise<void> {
    // 1. Get and delete all reports associated with this project
    const reports = await getProjectReports(projectId);
    const deletePromises = reports.map(r => r.id ? deleteReport(r.id) : Promise.resolve());
    await Promise.all(deletePromises);
    
    // 2. Delete the project document
    await deleteProject(projectId);
}
