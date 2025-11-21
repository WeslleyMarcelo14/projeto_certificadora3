// Firebase Admin SDK configuration for server-side operations
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check if we're in a server environment
const isServer = typeof window === 'undefined';

let adminApp: any = null;
let adminDb: any = null;

if (isServer) {
  try {
    // Only initialize Admin SDK if service account is explicitly provided
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey && getApps().length === 0) {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKey);
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'projetocertificadora3'
      });
      
      adminDb = getFirestore(adminApp);
      console.log('✅ Firebase Admin initialized with service account');
    } else if (serviceAccountKey && getApps().length > 0) {
      adminApp = getApps()[0];
      adminDb = getFirestore(adminApp);
    } else {
      console.log('ℹ️ Firebase Admin SDK disabled (no service account key). Using Client SDK.');
      // Don't initialize Admin SDK without proper credentials
    }
  } catch (error: any) {
    console.warn('⚠️ Firebase Admin initialization failed, using Client SDK only:', error?.message || error);
    // Don't throw here, let the app continue with client SDK
  }
}

// Safe function to get user role using Admin SDK
export async function getUserRoleAdmin(uid: string): Promise<string> {
  if (!adminDb || !isServer) {
    throw new Error('Admin SDK not available');
  }

  try {
    const userDoc = await adminDb.collection('users').doc(uid).get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData.role || 'participante';
    } else {
      return 'participante';
    }
  } catch (error) {
    console.error('Error getting user role with Admin SDK:', error);
    throw error;
  }
}

// Safe function to create user with Admin SDK
export async function createUserAdmin(uid: string, userData: any): Promise<void> {
  if (!adminDb || !isServer) {
    throw new Error('Admin SDK not available');
  }

  try {
    await adminDb.collection('users').doc(uid).set(userData, { merge: true });
  } catch (error) {
    console.error('Error creating user with Admin SDK:', error);
    throw error;
  }
}

export { adminDb, adminApp };
export const isAdminAvailable = !!adminDb;