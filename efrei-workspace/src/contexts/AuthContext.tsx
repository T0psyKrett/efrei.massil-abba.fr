"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";

const AUTHORIZED_EMAIL = "massilabba06@gmail.com";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    isAdmin: false,
    signInWithGoogle: async () => { },
    signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let unsub: (() => void) | undefined;

        import("firebase/auth").then(({ onAuthStateChanged }) => {
            import("@/services/firebase").then(({ auth }) => {
                if (!auth) { setLoading(false); return; }
                unsub = onAuthStateChanged(auth, (u) => {
                    // Only accept the authorized email
                    if (u && u.email !== AUTHORIZED_EMAIL) {
                        import("firebase/auth").then(({ signOut }) => {
                            signOut(auth);
                        });
                        setUser(null);
                    } else {
                        setUser(u);
                    }
                    setLoading(false);
                });
            });
        });

        return () => unsub?.();
    }, []);

    const signInWithGoogle = async () => {
        const { signInWithPopup, GoogleAuthProvider, signOut: fbSignOut } = await import("firebase/auth");
        const { auth } = await import("@/services/firebase");
        if (!auth) throw new Error("Firebase not configured");

        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);

        // Strict email check — reject immediately if wrong account
        if (credential.user.email !== AUTHORIZED_EMAIL) {
            await fbSignOut(auth);
            // Clear any local state if it was partially set
            setUser(null);
            throw new Error("Access denied. Unauthorized account.");
        }

        // Create server-side session cookie
        const idToken = await credential.user.getIdToken();
        await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
        });
    };

    const signOut = async () => {
        const { signOut: firebaseSignOut } = await import("firebase/auth");
        const { auth } = await import("@/services/firebase");
        if (auth) await firebaseSignOut(auth);
        await fetch("/api/auth/session", { method: "DELETE" });
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin: !!user, signInWithGoogle, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
