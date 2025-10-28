// lib/firebase/firestore.ts
import { db } from "./config";
import { doc, setDoc, getDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

// Criar/atualizar documento
export const setDocument = async (collectionName: string, docId: string, data: any) => {
  return setDoc(doc(db, collectionName, docId), data, { merge: true });
};

// Ler documento
export const getDocument = async (collectionName: string, docId: string) => {
  const docRef = doc(db, collectionName, docId);
  const snapshot = await getDoc(docRef);
  return snapshot.exists() ? snapshot.data() : null;
};

// Deletar documento
export const deleteDocument = async (collectionName: string, docId: string) => {
  return deleteDoc(doc(db, collectionName, docId));
};

// Listar documentos de uma coleção
export const listDocuments = async (collectionName: string) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
