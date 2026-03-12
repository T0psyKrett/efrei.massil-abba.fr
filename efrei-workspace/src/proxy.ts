import { NextRequest, NextResponse } from "next/server";

// Matcher covers all admin routes
export const config = {
    matcher: ["/admin/:path*", "/reports/new", "/reports/:id/edit", "/projects/new", "/projects/:id/edit"],
};

export async function proxy(request: NextRequest) {
    const sessionCookie = request.cookies.get("session")?.value;
    const { pathname } = request.nextUrl;

    // Allow the login page regardless of auth state to prevent loops
    if (pathname === "/admin/login") {
        return NextResponse.next();
    }

    // Lightweight check: if no session cookie, redirect to login
    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // Critical env var check (only checked once implicitly by checking every request)
    const criticalVars = ["FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY"];
    const missing = criticalVars.filter(v => !process.env[v]);
    if (missing.length > 0) {
        console.error(`CRITICAL ERROR: Missing environment variables: ${missing.join(", ")}`);
        // We don't throw here to avoid crashing the whole process for other users if it was a transient issue,
        // but we protect the admin routes.
        return new NextResponse("Server configuration error", { status: 500 });
    }

    return NextResponse.next();
}
