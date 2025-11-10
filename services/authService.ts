import { auth } from '../config/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const signUp = (email: string, password: string) => 
  createUserWithEmailAndPassword(auth, email, password);

export const signIn = (email: string, password: string) => 
  signInWithEmailAndPassword(auth, email, password);

export const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
};

export const logout = () => signOut(auth);
