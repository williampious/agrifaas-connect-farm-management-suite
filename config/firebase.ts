import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyD5ztvmQdxdQ3XQqQ6aek5seHzRE7av654",
  authDomain: "agrifaas-connect-9c16a.firebaseapp.com",
  projectId: "agrifaas-connect-9c16a",
  storageBucket: "agrifaas-connect-9c16a.firebasestorage.app",
  messagingSenderId: "221009876741",
  appId: "1:221009876741:web:b5026acc9cd1a63543096c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
