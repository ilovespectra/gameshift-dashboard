import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const Points: React.FC<{ onGameEnd: (points: number) => void }> = ({ onGameEnd }) => {
  const [points, setPoints] = useState(0);
  const [allUsers, setAllUsers] = useState([]);
  const wallet = useWallet(); 

  const handleButtonClick = () => {
    setPoints((prevPoints) => prevPoints + 10);
  };

  useEffect(() => {
    const gameTimer = setTimeout(() => {
      onGameEnd(points);
    }, 30000); // 30 seconds

    return () => clearTimeout(gameTimer);
  }, [points, onGameEnd]);

  useEffect(() => {
    const fetchAllUsers = async () => {
        try {
          // Fetch all users from Firestore database
          const users = await fetchFirestoreUsers();
          setAllUsers(users);

        } catch (error) {
          console.error('Error fetching users from Firestore:', error);
          // Handle error as needed
        }
      };

    // Call fetchAllUsers function to fetch users from Firestore
    fetchAllUsers();
  }, []);

  const fetchFirestoreUsers = async () => {
    try {
      // Replace 'users' with the actual collection name in your Firestore
      const usersCollection = collection(getFirestore(), 'users');
      const userSnapshot = await getDocs(usersCollection);
  
      if (userSnapshot.empty) {
        console.error('No users found in Firestore');
        return [];
      }
  
      // Map the documents to an array of user objects
      const users = userSnapshot.docs.map((doc) => {
        const userData = doc.data();
        // Ensure that each user object has a referenceId property
        const referenceId = userData.referenceId || userData.username || 'defaultReferenceId';
        return { ...userData, referenceId };
      });
  
      return users;
    } catch (error) {
      console.error('Error fetching users from Firestore:', error);
      return [];
    }
  };
  
  const fetchReferenceIdForPublicKey = async (publicKey) => {
    try {
      // Replace 'users' with the actual collection name in your Firestore
      const userSnapshot = await getDocs(query(collection(getFirestore(), 'users'), where('publicKey', '==', publicKey)));
      if (userSnapshot.empty) {
        console.error('No user found for the given public key:', publicKey);
        return null;
      } else {
        // Assuming 'username' is a field in the document
        const userData = userSnapshot.docs[0].data();
        console.log('User data for the given public key:', userData);
        const referenceId = userData.username;
        if (!referenceId) {
          console.error('Username not available in user data:', userData);
          return null;
        }
        return referenceId;
      }
    } catch (error) {
      console.error('Error fetching referenceId from Firestore:', error);
      return null;
    }
  };

  const handleEndGame = async () => {
    try {
      if (!wallet.connected) {
        console.error('Wallet not connected');
        // Handle the case where the wallet is not connected
        return;
      }

      const publicKey = wallet.publicKey?.toBase58() || '';

      if (!publicKey) {
        console.error('Public key not available');
        // Handle the case where the public key is not available
        return;
      }

      const referenceId = await fetchReferenceIdForPublicKey(publicKey);

    if (!referenceId) {
      console.error('ReferenceId not available');
      // Handle the case where the referenceId is not available
      return;
    }

    console.log('Reference ID fetched from Firestore:', referenceId);

      // Find the matching user from Firestore based on the referenceId
      const matchedUser = allUsers.find((user) => user.referenceId === referenceId);

      if (matchedUser) {
        console.log('Matched User from Firestore:', matchedUser);

        // Log the verbatim HTML request with the matched referenceId
        const apiKey = process.env.NEXT_PUBLIC_GAMESHIFT_API_KEY;
        const requestData = {
          details: {
            description: 'points token for gameshift-dash',
            name: 'POINTS',
            imageUrl: 'https://cdn.discordapp.com/attachments/1051281685234327613/1172897464441905172/image.png?ex=6561fce2&is=654f87e2&hm=1ed5e6603c87d8e7fe0f9b890019437b20280e590e275ed3a320671b46b54ec6&',
          },
          destinationUserReferenceId: referenceId, // Use the referenceId as the userReferenceId
        };

        // Log the verbatim HTML request
        const htmlRequest = `
POST /assets HTTP/1.1
Accept: application/json
X-Api-Key: ${apiKey}
Content-Type: application/json
Host: api.gameshift.dev
Content-Length: ${JSON.stringify(requestData).length}

${JSON.stringify(requestData, null, 2)}
`;

        // Make the API call
        const response = await axios.post('https://api.gameshift.dev/assets', requestData, {
          headers: {
            'Accept': 'application/json',
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
        });
        
        console.log('Points logged successfully:', response.data);
        // You can add more logic here if needed
      } else {
        console.error('No matching user found in Firestore for the given referenceId:', referenceId);
        // Handle the case where no matching user is found
      }
    } catch (error) {
        console.error('Error logging points:', error);
        // Add logic to display a user-friendly error message to the user
      }
    
  };

  return (
    <div>
      <h2>Points: {points}</h2>
      <button onClick={handleButtonClick} disabled={points >= 100}>
        Add 10 Points
      </button><br></br>
      <button onClick={handleEndGame}>End Game</button>
    </div>

    
  );
};

export default Points;
