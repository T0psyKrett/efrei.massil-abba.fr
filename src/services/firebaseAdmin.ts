// Firebase Admin SDK — server-only, never imported on the client
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App;

function getAdminApp(): App {
    if (getApps().length === 0) {
        let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || "";
        if (privateKey) {
            privateKey = privateKey.trim().replace(/^"|"$/g, "").replace(/\\n/g, "\n");
        }

        adminApp = initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "site-efreimassilabba",
                clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "site-efreimassilabba.firebasestorage.app",
        });
    } else {
        adminApp = getApps()[0];
    }
    return adminApp;
}

export function getAdminAuth() {
    return getAuth(getAdminApp());
}

export function getAdminStorage() {
    return getStorage(getAdminApp());
}

export function getAdminDb() {
    return getFirestore(getAdminApp());
}
