import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from './firebase'; // Make sure you have firebaseConfig defined in the 'firebase' file
import { PublicKey } from '@solana/web3.js';

// Initialize Firebase if not already initialized
const firebaseApp = initializeApp(firebaseConfig);

const fetchFirestoreUsers = async (walletPublicKey: PublicKey) => {
  try {
    // Fetch users from Firestore based on the wallet's public key
    const usersCollection = collection(getFirestore(firebaseApp), 'users');
    const usersQuery = query(usersCollection, where('publicKey', '==', walletPublicKey.toString()));
    const usersSnapshot = await getDocs(usersQuery);

    // Map the user data from Firestore documents
    const firestoreUsers = usersSnapshot.docs.map((doc) => ({
      referenceId: doc.data().referenceId,
      address: doc.data().publicKey,
      email: doc.data().email,
    }));

    console.log('Firestore Users:', firestoreUsers);

    return firestoreUsers;
  } catch (error) {
    console.error('Error fetching users from Firestore:', error);
    // Handle error as needed
    return [];
  }
};

export default fetchFirestoreUsers;
