import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getUsernameForConnectedWallet } from './getUsernameForPublicKey';
import { useWallet } from '@solana/wallet-adapter-react';

const ViewInventory: React.FC = () => {
  const { publicKey } = useWallet();
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        if (!publicKey) {
          console.error('Wallet not connected!');
          return;
        }

        const fetchedUsername = await getUsernameForConnectedWallet(publicKey.toBase58());
        setUsername(fetchedUsername);
      } catch (error) {
        console.error('Error fetching username:', error);
      }
    };

    fetchUsername();
  }, [publicKey]);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        // Check if the username is available
        if (!username) {
          console.error('Username not available');
          return;
        }

        // Use the username to make the API request
        const apiKey = process.env.NEXT_PUBLIC_GAMESHIFT_API_KEY;
        const response = await axios.get(
          `https://api.gameshift.dev/users/${encodeURIComponent(username)}/assets`,
          {
            headers: {
              Accept: 'application/json',
              'X-Api-Key': apiKey,
            },
          }
        );

        console.log('API Response:', response.data); // Log the API response

        // Set the inventory data in the state
        setInventoryData(response.data.data);
      } catch (error) {
        console.error('Error fetching inventory:', error);
        // Handle error as needed
      }
    };

    // Call the fetchInventory function
    fetchInventory();
  }, [username]);

  return (
    <div>
      <h2>Inventory</h2>
      {inventoryData.map((asset) => (
        <div key={asset.id} style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '20px' }}>
          <img src={asset.imageUrl} alt={asset.name} style={{ maxWidth: '100px', marginRight: '20px' }} />
          <div>
            <p style={{ display: 'flex', alignItems: 'flex-start'}}><strong>Name: </strong>&nbsp;{asset.name}</p>
            <p style={{ display: 'flex', alignItems: 'flex-start'}}><strong>Description: </strong>&nbsp;{asset.description}</p>
            <p style={{ display: 'flex', alignItems: 'flex-start'}}><strong>Mint Address: </strong>&nbsp;{asset.mintAddress}</p>
            <p style={{ display: 'flex', alignItems: 'flex-start'}}><strong>Status: </strong>&nbsp;{asset.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ViewInventory;
