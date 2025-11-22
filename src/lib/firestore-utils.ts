// Funções utilitárias para operações no Firestore
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

// Tipo para callback de erro
type ErrorCallback = (error: FirestoreError) => void;

// Função Debounce para evitar chamadas sucessivas rápidas
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

// Configuração segura de listener com limpeza automática e tratamento de erros
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
          firebaseErrorHandler.onError(error, `Firestore listener para ${collectionName}`);
          if (errorCallback && mounted) {
            errorCallback(error);
          }
        }
      );
    } catch (error) {
      console.error(`Erro ao configurar listener do Firestore para ${collectionName}:`, error);
      if (errorCallback && mounted) {
        errorCallback(error as FirestoreError);
      }
    }
  };

  // Configuração com pequeno atraso para prevenir conflitos de inicialização
  setTimeout(setup, 50);

  // Retorna a função de limpeza
  return () => {
    mounted = false;
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };
}

// Listener de contagem seguro para contagens simples
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

// Utilitário para aguardar o Firestore estar pronto
export function waitForFirestore(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }

    // Verificação para ver se o Firestore está acessível
    try {
      const testCollection = collection(db, 'test');
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}