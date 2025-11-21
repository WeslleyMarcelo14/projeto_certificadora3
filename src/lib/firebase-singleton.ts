// Firebase Singleton Pattern to prevent multiple initialization
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
  apiKey: "AIzaSyAwg1OWiLZ46GluDRAo8mctoLtBoCNJkQk",
  authDomain: "projetocertificadora3.firebaseapp.com",
  projectId: "projetocertificadora3",
  storageBucket: "projetocertificadora3.firebasestorage.app",
  messagingSenderId: "205182081215",
  appId: "1:205182081215:web:d58c2d956bb8962da88e0a"
};

// Initialize Firebase app only once using singleton pattern
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Connection state management
class FirestoreConnectionManager {
  private static instance: FirestoreConnectionManager;
  private db: any;
  private isInitialized = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastActivity = Date.now();
  private readonly IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly HEARTBEAT_INTERVAL = 30 * 1000; // 30 seconds

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
        // Enable network and setup connection monitoring
        await enableNetwork(this.db);
        this.setupConnectionMonitoring();
        this.isInitialized = true;
        console.log('✅ Firestore initialized successfully');
      }
    } catch (error) {
      console.error('❌ Error initializing Firestore:', error);
      throw error;
    }

    return this.db;
  }

  private setupConnectionMonitoring() {
    if (typeof window === 'undefined') return;

    // Start heartbeat to keep connection alive
    this.startHeartbeat();

    // Listen for page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handlePageHidden();
      } else {
        this.handlePageVisible();
      }
    });

    // Listen for online/offline events
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
        console.log('🔄 Firestore connection idle, refreshing...');
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
        console.log('✅ Firestore connection refreshed');
      }
    } catch (error) {
      console.warn('⚠️ Could not refresh Firestore connection:', error);
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
    console.log('🌐 Back online, refreshing Firestore connection');
    await this.refreshConnection();
  }

  private async handleOffline() {
    console.log('📴 Offline detected');
  }

  updateActivity() {
    this.lastActivity = Date.now();
  }

  getDb() {
    if (!this.db) {
      throw new Error('Firestore not initialized. Call initialize() first.');
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
        console.warn('Error terminating Firestore:', error);
      }
    }
    this.isInitialized = false;
  }
}

// Initialize Firestore with connection management
const connectionManager = FirestoreConnectionManager.getInstance();
let db: any;

if (typeof window !== 'undefined') {
  // Client-side initialization
  connectionManager.initialize().then(database => {
    db = database;
  }).catch(error => {
    console.error('Failed to initialize Firestore:', error);
  });
} else {
  // Server-side initialization
  db = getFirestore(app);
}

// Initialize Auth
export const auth = getAuth(app);

// Configure Google Auth Provider with better settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Initialize Realtime Database
export const database = getDatabase(app);

// Export Firestore with connection management
export { db };
export const firestoreManager = connectionManager;
export default app;