import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { WalletContextState, useWallet } from '@solana/wallet-adapter-react';

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

export const getUsernameForConnectedWallet = async (publicKey: WalletContextState['publicKey']) => {
  try {
    if (!publicKey) {
      console.error('Wallet not connected!');
      return null;
    }

    const usersCollection = collection(db, 'users');
    const q = query(usersCollection, where('publicKey', '==', publicKey.toBase58()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If a match is found, return the username
      return querySnapshot.docs[0].data().username;
    }
  } catch (error) {
    console.error('Error fetching username:', error);
  }

  return null; // Return null if no username is found
};
