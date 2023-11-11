import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { firebaseConfig } from './firebase'; 
import { PublicKey } from '@solana/web3.js';

const fetchFirestoreUsers = async (walletPublicKey: PublicKey) => {
  try {
    // Initialize Firebase if not already initialized
    if (firebase.getApps().length === 0) {
      initializeApp(firebaseConfig); // Replace with your actual Firebase configuration
    }

    // Fetch users from Firestore based on the wallet's public key
    const usersCollection = collection(getFirestore(), 'users');
    const usersQuery = query(usersCollection, where('publicKey', '==', walletPublicKey));
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
