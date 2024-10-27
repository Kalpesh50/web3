import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { walletAddress } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    console.log('Received request body:', req.body);
    console.log('Received token:', token);

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    if (!walletAddress) {
      return res.status(400).json({ success: false, message: 'Wallet address is required' });
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      console.log('Decoded token:', decoded);

      await client.connect();
      const database = client.db('web3');
      const admins = database.collection('admins');

      const result = await admins.updateOne(
        { username: decoded.username },
        { $set: { walletAddress: walletAddress } }
      );

      console.log('Update result:', result);

      if (result.modifiedCount === 1) {
        res.status(200).json({ success: true, message: 'Wallet address updated successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Failed to update wallet address' });
      }
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
