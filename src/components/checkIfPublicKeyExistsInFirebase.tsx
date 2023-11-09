import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

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

export const checkIfPublicKeyExistsInFirebase = async (publicKey) => {
    try {
      const usersCollection = collection(db, 'users');
    
      // Create a query to find documents where the 'publicKey' field matches the user's public key
      const q = query(usersCollection, where('publicKey', '==', publicKey));
    
      const querySnapshot = await getDocs(q);
    
      // If any matching documents are found, the public key is registered
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking if public key exists in Firebase:', error);
      return false;
    }
  };