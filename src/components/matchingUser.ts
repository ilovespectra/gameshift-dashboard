import axios from 'axios';

const getAllUsersFromGameshift = async (apiKey) => {
  try {
    const response = await axios.get('https://api.gameshift.dev/users', {
      headers: {
        Accept: 'application/json',
        'X-Api-Key': apiKey, // Pass the API key as an argument
      },
    });

    if (response.status === 200) {
      return response.data; // Return the list of users
    } else {
      console.error('Failed to retrieve users from Gameshift API:', response.status, response.statusText);
      return null;
    }
  } catch (error) {
    console.error('Error retrieving users from Gameshift API: ', error);
    return null;
  }
};

export default getAllUsersFromGameshift;
