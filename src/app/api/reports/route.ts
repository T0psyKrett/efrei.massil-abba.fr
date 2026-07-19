import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/services/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
    // Verify admin session
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session");
    if (!session?.value) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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
