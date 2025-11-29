// Padrão Singleton do Firebase para prevenir inicialização múltipla
import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getFirestore, 
  connectFirestoreEmulator, 
  enableNetwork, 
  disableNetwork,
  terminate,
  clearIndexedDbPersistence 
} from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Inicializa o app Firebase apenas uma vez usando o padrão singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Gerenciamento do estado da conexão com Firestore
class FirestoreConnectionManager {
  private static instance: FirestoreConnectionManager;
  private db: any;
  private isInitialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000; 
  private readonly HEARTBEAT_INTERVAL = 30 * 1000; 

  static getInstance(): FirestoreConnectionManager {
    if (!FirestoreConnectionManager.instance) {
      FirestoreConnectionManager.instance = new FirestoreConnectionManager();
    }
    return FirestoreConnectionManager.instance;
  }

  async initialize() {
    if (this.isInitialized && this.db) {
      return this.db;
    }

    try {
      this.db = getFirestore(app);
      
      if (typeof window !== 'undefined') {
        // Habilita a rede e configura o monitoramento da conexão
        await enableNetwork(this.db);
        this.setupConnectionMonitoring();
        this.isInitialized = true;
        console.log('Firestore inicializado com sucesso');
      }
    } catch (error) {
      console.error('Erro ao inicializar o Firestore:', error);
      throw error;
    }

    return this.db;
  }

  private setupConnectionMonitoring() {
    if (typeof window === 'undefined') return;

    // Inicia o heartbeat para manter a conexão ativa
    this.startHeartbeat();

    // listener para mudanças de visibilidade da página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Listeners para mudanças na conectividade da rede
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      const timeSinceLastActivity = Date.now() - this.lastActivity;
      
      if (timeSinceLastActivity > this.IDLE_TIMEOUT) {
        console.log('Conexão do Firestore ociosa, atualizando...');
        this.refreshConnection();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private async refreshConnection() {
    try {
      if (this.db) {
        await disableNetwork(this.db);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await enableNetwork(this.db);
        this.updateActivity();
        console.log('Conexão do Firestore atualizada com sucesso');
      }
    } catch (error) {
      console.warn('Não foi possível atualizar a conexão do Firestore:', error);
    }
  }

  private handlePageHidden() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private handlePageVisible() {
    this.updateActivity();
    this.startHeartbeat();
    this.refreshConnection();
  }

  private async handleOnline() {
    console.log('Online novamente, atualizando conexão do Firestore');
    await this.refreshConnection();
  }

  private async handleOffline() {
    console.log('Offline detectado');
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  getDb() {
    if (!this.db) {
      throw new Error('Firestore não foi inicializado ainda.');
    }
    this.updateActivity();
    return this.db;
  }

  async cleanup() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.db) {
      try {
        await terminate(this.db);
      } catch (error) {
        console.warn('Erro ao encerrar o Firestore:', error);
      }
    }
    this.isInitialized = false;
  }
}

// Inicializa o Firestore com gerenciamento de conexão
const connectionManager = FirestoreConnectionManager.getInstance();
let db: any;

if (typeof window !== 'undefined') {
  // Inicialização Client-side
  connectionManager.initialize().then(database => {
    db = database;
  }).catch(error => {
    console.error('Failed to initialize Firestore:', error);
  });
} else {
  // Inicialização Server-side
  db = getFirestore(app);
}

// Inicializa a Autenticação
export const auth = getAuth(app);

// Configura o Provedor de Autenticação do Google com melhores configurações
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Inicializa o Realtime Database
export const database = getDatabase(app);

// Exporta o Firestore com gerenciamento de conexão
export { db };
export const firestoreManager = connectionManager;
export default app;