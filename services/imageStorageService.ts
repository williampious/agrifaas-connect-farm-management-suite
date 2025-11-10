import { uploadFile } from './storageService';
import { auth } from '../config/firebase';

export const uploadPlantImage = async (base64Image: string): Promise<string> => {
  const userId = auth.currentUser?.uid || 'anonymous';
  const blob = await fetch(base64Image.startsWith('data:') ? base64Image : `data:image/jpeg;base64,${base64Image}`).then(r => r.blob());
  const imageId = `plant_${Date.now()}.jpg`;
  const file = new File([blob], imageId, { type: 'image/jpeg' });
  return uploadFile(`plant-images/${userId}/${imageId}`, file);
};
