// getDocumentIdForPublicKey.tsx

import { getFirestore, collection, where, query, getDocs } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const getDocumentIdForPublicKey = async (publicKey: string): Promise<string | null> => {
  try {
    // Query the Firestore collection to find the document ID based on the publicKey
    const q = query(collection(db, 'users'), where('publicKey', '==', publicKey));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming there is only one document matching the publicKey
      const documentId = querySnapshot.docs[0].id;
      return documentId;
    } else {
      // No document found for the given publicKey
      console.log('No document found for publicKey:', publicKey);
      return null;
    }
  } catch (error) {
    console.error('Error fetching document ID for publicKey:', error);
    return null;
  }
};

export default getDocumentIdForPublicKey;
