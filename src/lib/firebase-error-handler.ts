// Utilitários de monitoramento e tratamento de erros para o Firebase
import { FirestoreError } from 'firebase/firestore';

// Tipos de erro do Firebase
export enum FirebaseErrorType {
  INTERNAL_ASSERTION = 'internal-assertion-failed',
  PERMISSION_DENIED = 'permission-denied',
  UNAVAILABLE = 'unavailable',
  NETWORK = 'network-error',
  UNKNOWN = 'unknown'
}

// Interface de erros
export interface ErrorHandler {
  onError: (error: FirestoreError, context?: string) => void;
  onRetry?: (error: FirestoreError, attempt: number) => boolean;
}

// Manipulador de erros padrão
export class DefaultFirebaseErrorHandler implements ErrorHandler {
  private maxRetries = 3;
  private retryDelay = 1000;

  onError(error: FirestoreError, context = 'Firebase operation'): void {
    const errorType = this.classifyError(error);
    
    console.error(`Erro do Firebase em ${context}:`, {
      type: errorType,
      code: error.code,
      message: error.message,
      stack: error.stack
    });

    // Trata tipos de erro específicos
    switch (errorType) {
      case FirebaseErrorType.INTERNAL_ASSERTION:
        console.warn('Falha de asserção interna. Verifique a integridade dos dados e a lógica do aplicativo.');
        break;
      case FirebaseErrorType.PERMISSION_DENIED:
        console.warn('Permissão negada. Verifique as regras de segurança do Firestore.');
        break;
      case FirebaseErrorType.UNAVAILABLE:
        console.warn('Serviço indisponível. Pode ser um problema temporário de rede ou do servidor.');
        break;
    }
  }

  onRetry(error: FirestoreError, attempt: number): boolean {
    const errorType = this.classifyError(error);
    
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

// Wrapper de repetição para operações do Firebase
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
  
  throw lastError || new Error('A operação falhou sem um erro específico');
}

// Instância Singleton para a aplicação
export const firebaseErrorHandler = new DefaultFirebaseErrorHandler();