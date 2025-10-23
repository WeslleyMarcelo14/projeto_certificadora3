// src/app/firebase/page.tsx
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAwg1OWiLZ46GluDRAo8mctoLtBoCNJkQk",
  authDomain: "projetocertificadora3.firebaseapp.com",
  projectId: "projetocertificadora3",
  storageBucket: "projetocertificadora3.firebasestorage.app",
  messagingSenderId: "205182081215",
  appId: "1:205182081215:web:d58c2d956bb8962da88e0a"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app); 
export const auth = getAuth(app);
export const database = getDatabase(app);