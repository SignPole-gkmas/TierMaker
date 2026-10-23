import { initializeApp } from 'firebase/app';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { connectDatabaseEmulator, getDatabase, type Database } from 'firebase/database';

const useEmulator = import.meta.env.VITE_USE_EMULATOR === 'true';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-tiermaker';
const databaseURL =
  import.meta.env.VITE_FIREBASE_DATABASE_URL || (useEmulator ? `https://${projectId}-default-rtdb.firebaseio.com` : '');

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: databaseURL || undefined,
});

export const db = getFirestore(app);

/** 「n人がプレイ中」用の Realtime Database。URL 未設定なら機能ごと無効 */
export const rtdb: Database | null = databaseURL ? getDatabase(app) : null;

if (useEmulator) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  if (rtdb) connectDatabaseEmulator(rtdb, '127.0.0.1', 9000);
}
