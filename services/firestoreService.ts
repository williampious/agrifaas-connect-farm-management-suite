import { db } from '../config/firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';

export const getDocument = (collectionName: string, docId: string) => 
  getDoc(doc(db, collectionName, docId));

export const getCollection = (collectionName: string) => 
  getDocs(collection(db, collectionName));

export const queryCollection = (collectionName: string, field: string, operator: any, value: any) => 
  getDocs(query(collection(db, collectionName), where(field, operator, value)));

export const setDocument = (collectionName: string, docId: string, data: any) => 
  setDoc(doc(db, collectionName, docId), data);

export const updateDocument = (collectionName: string, docId: string, data: any) => 
  updateDoc(doc(db, collectionName, docId), data);

export const deleteDocument = (collectionName: string, docId: string) => 
  deleteDoc(doc(db, collectionName, docId));
