import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';
import getAllUsersFromGameshift from './matchingUser'; 

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const logToFirebase = async (username: string, email: string, publicKey: string, matchingUser: any) => {
  try {
    // Assuming you already have the 'matchingUser' data from your Gameshift API response
    if (getAllUsersFromGameshift) {
      // Assuming you have a 'users' collection in Firestore
      const usersCollection = collection(db, 'users');
      const user = {
        username,
        email,
        publicKey,
        address: matchingUser.address, // Add the address from the Gameshift user data
      };

      // Add the user data to the 'users' collection
      const docRef = await addDoc(usersCollection, user);
      console.log('Document written with ID: ', docRef.id);
    } else {
      console.error('No matching user found in Gameshift data.');
    }
  } catch (error) {
    console.error('Error adding document to Firestore: ', error);
  }
};

export default logToFirebase;