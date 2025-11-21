// Error monitoring and handling utilities for Firebase
import { FirestoreError } from 'firebase/firestore';

// Error types that we want to handle specifically
export enum FirebaseErrorType {
  INTERNAL_ASSERTION = 'internal-assertion-failed',
  PERMISSION_DENIED = 'permission-denied',
  UNAVAILABLE = 'unavailable',
  NETWORK = 'network-error',
  UNKNOWN = 'unknown'
}

// Error handler interface
export interface ErrorHandler {
  onError: (error: FirestoreError, context?: string) => void;
  onRetry?: (error: FirestoreError, attempt: number) => boolean;
}

// Default error handler
export class DefaultFirebaseErrorHandler implements ErrorHandler {
  private maxRetries = 3;
  private retryDelay = 1000; // 1 second

  onError(error: FirestoreError, context = 'Firebase operation'): void {
    const errorType = this.classifyError(error);
    
    console.error(`🔥 Firebase Error in ${context}:`, {
      type: errorType,
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    // Handle specific error types
    switch (errorType) {
      case FirebaseErrorType.INTERNAL_ASSERTION:
        console.warn('⚠️ Internal assertion error detected. This may be due to concurrent operations or initialization issues.');
        break;
      case FirebaseErrorType.PERMISSION_DENIED:
        console.warn('⚠️ Permission denied. Check Firestore rules and user authentication.');
        break;
      case FirebaseErrorType.UNAVAILABLE:
        console.warn('⚠️ Firestore unavailable. Check network connection.');
        break;
    }
  }

  onRetry(error: FirestoreError, attempt: number): boolean {
    const errorType = this.classifyError(error);
    
    // Only retry for certain error types
    if (errorType === FirebaseErrorType.UNAVAILABLE || 
        errorType === FirebaseErrorType.NETWORK ||
        errorType === FirebaseErrorType.INTERNAL_ASSERTION) {
      return attempt < this.maxRetries;
    }
    
    return false;
  }

  private classifyError(error: FirestoreError): FirebaseErrorType {
    if (error.message?.includes('INTERNAL ASSERTION FAILED')) {
      return FirebaseErrorType.INTERNAL_ASSERTION;
    }
    
    switch (error.code) {
      case 'permission-denied':
        return FirebaseErrorType.PERMISSION_DENIED;
      case 'unavailable':
        return FirebaseErrorType.UNAVAILABLE;
      default:
        if (error.message?.toLowerCase().includes('network')) {
          return FirebaseErrorType.NETWORK;
        }
        return FirebaseErrorType.UNKNOWN;
    }
  }
}

// Retry wrapper for Firebase operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  errorHandler: ErrorHandler = new DefaultFirebaseErrorHandler(),
  context = 'Firebase operation'
): Promise<T> {
  let lastError: FirestoreError | null = null;
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as FirestoreError;
      errorHandler.onError(lastError, context);
      
      if (attempt < 3 && errorHandler.onRetry?.(lastError, attempt)) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        continue;
      }
      
      break;
    }
  }
  
  throw lastError || new Error('Operation failed without specific error');
}

// Singleton instance for the application
export const firebaseErrorHandler = new DefaultFirebaseErrorHandler();