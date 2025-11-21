// Utility functions for safer Firestore operations
import { db } from './firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  Unsubscribe,
  FirestoreError 
} from 'firebase/firestore';
import { firebaseErrorHandler } from './firebase-error-handler';

// Type for error callback
type ErrorCallback = (error: FirestoreError) => void;

// Debounce function to prevent rapid successive calls
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

// Safe listener setup with automatic cleanup and error handling
export function setupFirestoreListener<T>(
  collectionName: string,
  callback: (data: T[]) => void,
  errorCallback?: ErrorCallback,
  queryConstraints?: any[]
): () => void {
  let unsubscribe: Unsubscribe | null = null;
  let mounted = true;

  const debouncedCallback = debounce(callback, 100);

  const setup = async () => {
    try {
      if (!mounted) return;

      const collectionRef = collection(db, collectionName);
      const q = queryConstraints 
        ? query(collectionRef, ...queryConstraints)
        : collectionRef;

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!mounted) return;
          
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          })) as T[];
          
          debouncedCallback(data);
        },
        (error) => {
          firebaseErrorHandler.onError(error, `Firestore listener for ${collectionName}`);
          if (errorCallback && mounted) {
            errorCallback(error);
          }
        }
      );
    } catch (error) {
      console.error(`Error setting up Firestore listener for ${collectionName}:`, error);
      if (errorCallback && mounted) {
        errorCallback(error as FirestoreError);
      }
    }
  };

  // Setup with small delay to prevent initialization conflicts
  setTimeout(setup, 50);

  // Return cleanup function
  return () => {
    mounted = false;
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
}

// Safe counter listener for simple counts
export function setupCountListener(
  collectionName: string,
  callback: (count: number) => void,
  errorCallback?: ErrorCallback,
  queryConstraints?: any[]
): () => void {
  return setupFirestoreListener(
    collectionName,
    (data: any[]) => callback(data.length),
    errorCallback,
    queryConstraints
  );
}

// Utility to wait for Firestore to be ready
export function waitForFirestore(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      // Server-side, assume ready
      resolve();
      return;
    }

    // Simple check to see if Firestore is accessible
    try {
      const testCollection = collection(db, 'test');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}