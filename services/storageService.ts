import { storage } from '../config/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadFile = async (path: string, file: File) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
};

export const getFileURL = (path: string) => 
  getDownloadURL(ref(storage, path));

export const deleteFile = (path: string) => 
  deleteObject(ref(storage, path));
