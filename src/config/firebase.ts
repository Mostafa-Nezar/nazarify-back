import "dotenv/config";
import { cert, initializeApp, type ServiceAccount } from "firebase-admin/app";

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
if (!serviceAccountJson) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
const serviceAccount = JSON.parse(serviceAccountJson) as ServiceAccount;

initializeApp({ credential: cert(serviceAccount) });
