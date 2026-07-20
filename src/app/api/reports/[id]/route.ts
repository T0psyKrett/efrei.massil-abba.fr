import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/services/firebaseAdmin";
import { cookies } from "next/headers";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const db = getAdminDb();
        const doc = await db.collection("reports").doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: "Rapport non trouvé" }, { status: 404 });
        }

        return NextResponse.json({ id: doc.id, ...doc.data() }, { status: 200 });
    } catch (err: any) {
        console.error("GET /api/reports/[id] error:", err);
        return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
    }
}

export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie && process.env.NODE_ENV !== "development") {
        return NextResponse.json({ error: "Non autorisé — administrateur requis" }, { status: 401 });
    }

    try {
        const { id } = await context.params;
        const db = getAdminDb();
        await db.collection("reports").doc(id).delete();
        return NextResponse.json({ success: true, id }, { status: 200 });
    } catch (err: any) {
        console.error("DELETE /api/reports/[id] error:", err);
        return NextResponse.json({ error: err.message || "Erreur serveur" }, { status: 500 });
    }
}
