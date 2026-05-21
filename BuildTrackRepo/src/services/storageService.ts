/**
 * Firebase Storage service for project photos/documents
 */
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseStorage } from './firebase';
import { isFirebaseConfigured } from '../config/env';

/**
 * Upload an image file and return its download URL
 */
export async function uploadProjectImage(
  projectId: string,
  uri: string,
  fileName: string
): Promise<string> {
  if (!isFirebaseConfigured()) {
    // Return local URI in demo mode
    return uri;
  }

  const storage = getFirebaseStorage();
  if (!storage) throw new Error('Storage not initialized');

  const response = await fetch(uri);
  const blob = await response.blob();
  const storageRef = ref(storage, `projects/${projectId}/${fileName}`);

  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
