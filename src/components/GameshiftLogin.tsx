import React, { useState, FormEvent } from 'react';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firebaseApp } from './firebase';
import { useWallet } from '@solana/wallet-adapter-react';


const Login: React.FC = () => {
  const [isSuccessMessageVisible, setSuccessMessageVisible] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
  });
  const db = getFirestore(firebaseApp);
  const { publicKey } = useWallet();
  const apiKey = process.env.NEXT_PUBLIC_GAMESHIFT_API_DEV_KEY; // Set the Gameshift API key from environment variables

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const { username, email } = formData;

    if (!publicKey) {
      console.error('User not authenticated with a connected wallet');
      return;
    }

    try {
      // Use getFirestore to obtain a Firestore instance
      const db = getFirestore(firebaseApp);
      const loginEntriesRef = collection(db, 'LoginEntries'); // Correct collection name
      await addDoc(loginEntriesRef, {
        username,
        email,
        apiKey, // Use the apiKey obtained from environment variables
        walletPublicKey: publicKey.toBase58(),
        timestamp: serverTimestamp(),
      });

      console.log('User Logged In');
      setSuccessMessageVisible(true);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <form onSubmit={handleSubmit} id="LoginForm">
        <div>
          <label className="input-label" htmlFor="username">
            Username
          </label>
          <br />
          <input
            type="text"
            id="username"
            className="text-input"
            required
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="input-label" htmlFor="email">
            Email
          </label>
          <br />
          <input
            type="email"
            id="email"
            className="text-input"
            required
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <button className="btn" type="submit">
          Login
        </button>
      </form>
      {isSuccessMessageVisible && (
        <p>
          <i>You have been logged in successfully!</i>
        </p>
      )}
    </div>
  );
};

export default Login;
