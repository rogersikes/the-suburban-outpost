import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Configuration loaded from provisioned firebase-applet-config.json
const firebaseConfig = {
  projectId: "gen-lang-client-0135406376",
  appId: "1:319012968593:web:d53f64fb34a9f769730730",
  apiKey: "AIzaSyCYMVWhdxvj_JiJ_8slXAsENMYv9RGzVc0",
  authDomain: "gen-lang-client-0135406376.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-thesuburbanoutpo-372546f8-cde4-4bf5-bf0a-c8c94690e7b8",
  storageBucket: "gen-lang-client-0135406376.firebasestorage.app",
  messagingSenderId: "319012968593"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

// Validate connection per Firebase skill instructions
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_probe'));
    return true;
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn("Firestore client is offline or network error.");
      return false;
    }
    // Document not found is still a valid successful server handshake
    return true;
  }
}
