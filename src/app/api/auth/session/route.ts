import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/services/firebaseAdmin";

// POST /api/auth/session — called by client after Firebase sign-in to set HttpOnly cookie
export async function POST(req: NextRequest) {
    try {
        const { idToken } = await req.json();

        // Create a session cookie (5-day expiry)
        const expiresIn = 60 * 60 * 24 * 5 * 1000;
        const sessionCookie = await getAdminAuth().createSessionCookie(idToken, { expiresIn });

        const response = NextResponse.json({ status: "ok" });
        response.cookies.set("session", sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            sameSite: "lax",
        });
        return response;
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

// DELETE /api/auth/session — called by client on sign-out to clear cookie
export async function DELETE() {
    const response = NextResponse.json({ status: "ok" });
    response.cookies.delete("session");
    return response;
}
