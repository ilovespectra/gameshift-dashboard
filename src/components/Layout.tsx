import { FC, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { useWallet } from '@solana/wallet-adapter-react';
import { notify } from '../utils/notifications';
import axios from 'axios';
import logToFirebase from '../components/logToFirebase';
import { checkIfPublicKeyExistsInFirebase } from './checkIfPublicKeyExistsInFirebase';
import { getUsernameForConnectedWallet } from './getUsernameForPublicKey';
import getDocumentIdForPublicKey from './getDocumentIdForPublicKey';

export const Layout: FC = ({ children }) => {
  const { publicKey } = useWallet();
  const isWalletConnected = !!publicKey;

  const [isRegistered, setIsRegistered] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [inputUsername, setInputUsername] = useState(newUsername);

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

  const [isUpdateSectionVisible, setIsUpdateSectionVisible] = useState(false);
  
  useEffect(() => {
    const checkRegistration = async () => {
      if (isWalletConnected) {
        const publicKeyExistsInFirebase = await checkIfPublicKeyExistsInFirebase(publicKey.toBase58());
        
        if (publicKeyExistsInFirebase) {
          // Log the document ID associated with the public key
          const userDocId = await getDocumentIdForPublicKey(publicKey.toBase58());
          console.log('Document ID for the connected wallet:', userDocId);
    
          setIsRegistered(true);
    
          try {
            const fetchedUsername = await getUsernameForConnectedWallet(publicKey);
    
            if (fetchedUsername) {
              setUsername(fetchedUsername);
            } else {
              console.log('Username not found for public key:', publicKey.toBase58());
            }
          } catch (error) {
            console.error('Error fetching username:', error);
          }
        } else {
          setIsRegistered(false);
        }
      }
    };
    checkRegistration();
  }, [isWalletConnected, publicKey]);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };
  
  const handleRegistration = async () => {
    if (!isWalletConnected) {
      console.error("Wallet not connected!");
      notify({
        type: "error",
        message: "Error",
        description: "Wallet not connected!",
      });
      return;
    }
    setNewUsername('');
    try {
      // Reset the inputUsername state to an empty string
      setInputUsername('');
  
      const userRef = doc(db, 'users', inputUsername);// Use the newUsername as the document ID

      // Prepare the request data
      const requestData = {
        referenceId: inputUsername,
        email,
      };

      const response = await axios.post("https://api.gameshift.dev/users", requestData, {
        headers: {
          "X-Api-Key": process.env.NEXT_PUBLIC_GAMESHIFT_API_KEY,
        },
      });
      
      if (response.status === 201) {
        console.log("Registration successful");
        console.log("Registered data:", response.data);

        // Pass the individual values to the logToFirebase function
        logToFirebase(response.data.referenceId, response.data.email, publicKey?.toBase58(), response.data);

        // Update isRegistered to true after successful registration
        setIsRegistered(true);

        // Update the username state
        setUsername(response.data.referenceId);

        // Add the user data to Firestore using the inputUsername as the document ID
        await setDoc(userRef, { username: inputUsername, publicKey: publicKey?.toBase58(), email });
      } else {
        console.error("Registration failed with status:", response.status);
        notify({
          type: "error",
          message: "Error",
          description: "Registration failed with status: " + response.status,
        });
      }
    } catch (error) {
      console.error("Error registering user:", error);
      notify({
        type: "error",
        message: "Error",
        description: "Error registering user.",
      });
    }
  };

  const handleComponentChange = (component: string) => {
    // Implement the logic to change the active component based on the "component" parameter
    // For example, set the activeComponent state.
  };
  const [tempNewUsername, setTempNewUsername] = useState('');
  // const handleNewUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  //   const newUsernameValue = event.target.value;

  //   setTempNewUsername(newUsernameValue);
  // };

  const handleNewUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUsernameValue = event.target.value;
  
    // Update the inputUsername state directly
    setInputUsername(newUsernameValue);
  };
  const handleUpdateUsername = async () => {
    console.log('handleUpdateUsername function called');
  
    if (!isWalletConnected) {
      console.error('Wallet not connected!');
      notify({ type: 'error', message: 'Error', description: 'Wallet not connected!' });
      return;
    }
  
    try {
      // Use the dynamically fetched document ID
      const documentId = await getDocumentIdForPublicKey(publicKey.toBase58());
      const userRef = doc(db, 'users', documentId);
  
      // Check if the user exists
      const userDoc = await getDoc(userRef);
  
      console.log('User Reference:', userRef);
      console.log('User Document:', userDoc);
  
      if (userDoc.exists()) {
        // Fetch the existing username associated with the user
        const currentUsername = userDoc.data()?.username || ''; // Use the optional chaining operator to handle undefined
        console.log('Current Username:', currentUsername);
  
        console.log('Updating username to:', inputUsername);
        // Update the username with the new value (inputUsername)
        await updateDoc(userRef, { username: inputUsername });
  
        // Fetch and display the updated user information
        const updatedUserDoc = await getDoc(userRef);
  
        if (updatedUserDoc.exists()) {
          // Update the local state with the new username
          const updatedUsername = updatedUserDoc.data()?.username || '';
          setUsername(updatedUsername);
  
          // Notify the user of the successful update
          notify({ type: 'success', message: 'Success', description: 'Username updated successfully!' });
  
          // Set isUpdateSectionVisible to false to cancel the update
          setIsUpdateSectionVisible(false);
        } else {
          console.error('Updated user not found.');
          notify({ type: 'error', message: 'Error', description: 'Updated user not found.' });
        }
      } else {
        console.error('User not found.');
        notify({ type: 'error', message: 'Error', description: 'User not found.' });
      }
    } catch (error) {
      console.error('Error updating username:', error);
      notify({ type: 'error', message: 'Error', description: 'Error updating username.' + error.message });
    }
  };
  
  return (
    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">
        <h4 className="md:w-full text-center text-slate-300 my-2">
          <h1>Gameshift Dashboard</h1>
        </h4>

        <div>
          {isWalletConnected ? (
            isRegistered ? (
              <div>
                
              </div>
            ) : (
              <div className="registrationForm">
              <input
                type="text"
                placeholder="Username"
                value={inputUsername}
                onChange={handleNewUsernameChange}
                autoComplete="off"
              />

                <input
                  type="text"
                  placeholder="Email"
                  value={email}
                  onChange={handleEmailChange}
                  autoComplete="off" 
                />
                <button onClick={handleRegistration}>Register</button>
              </div>
            )
          ) : (
            null // If the wallet is not connected, display nothing (no buttons)
          )}
        </div>

        {isWalletConnected && isRegistered && (
          <div className="text-center">
  <div className="registrationForm">
    <p style={{ fontSize: '1.5rem' }}>
      <i>Welcome, {username}!</i>
    </p>
    <button
      onClick={() => setIsUpdateSectionVisible(!isUpdateSectionVisible)}
      style={{
        fontSize: isUpdateSectionVisible ? '0.8rem' : '1rem',
        color: 'purple',
        textDecoration: 'underline',
        background: 'none',
        border: 'none',
        marginBottom: '5px',
        cursor: 'pointer',
      }}
    >
      {isUpdateSectionVisible ? "Cancel Update" : "Update Username"}
    </button>
    {isUpdateSectionVisible && (
      <div className="update-username-form">
        <input
          type="text"
          placeholder="Username"
          value={inputUsername}
          onChange={handleNewUsernameChange}
          autoComplete="off"
        />
        <button
          style={{
            fontSize: '0.8rem',
            background: 'linear-gradient(to right, #4CAF50, #4B0082)',
            color: 'white',
            marginLeft: '10px',
            borderRadius: '15px',
            border: 'none',
            padding: '8px 16px',
            cursor: 'pointer',
          }}
          onClick={handleUpdateUsername}
        >
          Update Username
        </button>
     </div>
      )}
    </div>
    <button
      onClick={() => handleComponentChange("asset")}
      className="group w-30 m-2 btn disabled:animate-none"
    >
      Create Asset
    </button>
          <button
            onClick={() => handleComponentChange("transfer")}
            className="group w-30 m-2 btn disabled:animate-none"
          >
            Transfer Asset
          </button>
          <button
            onClick={() => handleComponentChange("payment")}
            className="group w-30 m-2 btn disabled:animate-none"
          >
            Payment
          </button>
          <button
            onClick={() => handleComponentChange("view")}
            className="group w-30 m-2 btn disabled:animate-none"
          >
            View Inventory
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
