import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/services/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export async function GET() {
    try {
        const db = getAdminDb();
        const snap = await db.collection("reports").orderBy("createdAt", "desc").get();
        const reports = snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
        }));
        return NextResponse.json(reports, { status: 200 });
    } catch (err: any) {
        console.error("GET /api/reports error:", err);
        return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    // Check session cookie exists (allow in development environment)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;
    const isDev = process.env.NODE_ENV === "development";

    if (!sessionCookie && !isDev) {
        return NextResponse.json({ error: "Non autorisé — veuillez vous reconnecter" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const db = getAdminDb();

        const docRef = await db.collection("reports").add({
            ...body,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return NextResponse.json({ id: docRef.id }, { status: 200 });
    } catch (err: any) {
        console.error("createReport API error:", err);
        return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
    }
}
