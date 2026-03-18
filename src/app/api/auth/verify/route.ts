import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/services/firebaseAdmin";

// POST /api/auth/verify — called by middleware to validate session cookie using firebase-admin
export async function POST(req: NextRequest) {
    try {
        const { sessionCookie } = await req.json();
        await getAdminAuth().verifySessionCookie(sessionCookie, true);
        return NextResponse.json({ valid: true });
    } catch {
        return NextResponse.json({ valid: false }, { status: 401 });
    }
}
