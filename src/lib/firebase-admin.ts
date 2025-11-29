// Configuração do Firebase Admin SDK
import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const isServer = typeof window === 'undefined';

let adminApp: any = null;
let adminDb: any = null;

if (isServer) {
  try {
    // Inicializa o Admin SDK apenas se a conta de serviço for fornecida
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (serviceAccountKey && getApps().length === 0) {
      const serviceAccount: ServiceAccount = JSON.parse(serviceAccountKey);
      
      adminApp = initializeApp({
        credential: cert(serviceAccount),
        projectId: 'projetocertificadora3'
      });
      
      adminDb = getFirestore(adminApp);
      console.log('Firebase Admin inicializado com conta de serviço');
    } else if (serviceAccountKey && getApps().length > 0) {
      adminApp = getApps()[0];
      adminDb = getFirestore(adminApp);
    } else {
      console.log('ℹFirebase Admin SDK desativado (sem chave de conta de serviço). Usando Client SDK.');
      // Não inicializa o Admin SDK sem as credenciais adequadas
    }
  } catch (error: any) {
    console.warn('Falha na inicialização do Firebase Admin, usando apenas Client SDK:', error?.message || error);
  }
}

// Função para obter o cargo do usuário usando o Admin SDK
export async function getUserRoleAdmin(uid: string): Promise<string> {
  if (!adminDb || !isServer) {
    throw new Error('Admin SDK não está disponível');
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
    console.error('Erro ao obter função do usuário com Admin SDK:', error);
    throw error;
  }
}

// Função segura para criar usuário com o Admin SDK
export async function createUserAdmin(uid: string, userData: any): Promise<void> {
  if (!adminDb || !isServer) {
    throw new Error('Admin SDK não está disponível');
  }

  try {
    await adminDb.collection('users').doc(uid).set(userData, { merge: true });
  } catch (error) {
    console.error('Erro ao criar usuário com Admin SDK:', error);
    throw error;
  }
}

export { adminDb, adminApp };
export const isAdminAvailable = !!adminDb;