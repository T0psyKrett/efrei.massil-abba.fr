import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/services/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    // Verify session cookie (same name as set by /api/auth/session)
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
        return NextResponse.json({ error: "Non autorisé — cookie manquant" }, { status: 401 });
    }

    try {
        // Validate the session cookie with Firebase Admin
        await getAdminAuth().verifySessionCookie(sessionCookie, true);
    } catch {
        return NextResponse.json({ error: "Non autorisé — session invalide" }, { status: 401 });
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
