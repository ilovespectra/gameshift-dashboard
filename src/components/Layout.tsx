import { FC, ReactNode, useState, useCallback, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { useWallet } from "@solana/wallet-adapter-react";
import { notify } from "../utils/notifications";
import axios from "axios";
import logToFirebase from "../components/logToFirebase";
import { checkIfPublicKeyExistsInFirebase } from "./checkIfPublicKeyExistsInFirebase";
import { getUsernameForPublicKey } from "./getUsernameForPublicKey";

const Layout = ({ children }) => {
  const { publicKey } = useWallet();
  const isWalletConnected = !!publicKey;

  const [isRegistered, setIsRegistered] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Fetch the username only if wallet is connected and registered
  useEffect(() => {
    const fetchUsername = async () => {
      if (isWalletConnected && isRegistered) {
        // Check if the public key is registered and retrieve the associated username
        const fetchedUsername = await getUsernameForPublicKey(publicKey.toBase58());
    
        if (fetchedUsername) {
          setUsername(fetchedUsername);
        }
      }
    };

    fetchUsername();
  }, [isWalletConnected, isRegistered, publicKey]);

  useEffect(() => {
    const checkRegistration = async () => {
      if (isWalletConnected) {
        // Check if the publicKey exists in Firebase
        const publicKeyExistsInFirebase = await checkIfPublicKeyExistsInFirebase(publicKey.toBase58());

        if (publicKeyExistsInFirebase) {
          // If the public key is registered, set isRegistered to true
          setIsRegistered(true);

          // Fetch the username associated with the publicKey from Firebase
          const fetchedUsername = await getUsernameForPublicKey(publicKey.toBase58());
          
          if (fetchedUsername) {
            setUsername(fetchedUsername);
          }
        } else {
          // If the public key is not registered, set isRegistered to false
          setIsRegistered(false);
        }
      }
    };

    checkRegistration();
  }, [isWalletConnected, publicKey]);

  const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

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

  const onClick = useCallback(async () => {
    if (!isWalletConnected) {
      console.error("Wallet not connected!");
      notify({
        type: "error",
        message: "Error",
        description: "Wallet not connected!",
      });
      return;
    }
  }, [isWalletConnected]);

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
  
    // Prepare the request data
    const requestData = {
      referenceId: username,
      email,
    };
  
    try {
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
              <p>
                <i>Welcome, {username}!</i>
              </p>
              <p>Connected with <i>{publicKey?.toBase58().substring(0, 5)}...</i></p>
            </div>
          ) : (
            <div className="registrationForm">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={handleUsernameChange}
                autoComplete="off" // Disable auto-fill
              />
              <input
                type="text"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                autoComplete="off" // Disable auto-fill
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
