import { MongoClient } from 'mongodb';
import { sign } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, password } = req.body;

    try {
      console.log('Attempting to connect to MongoDB...');
      await client.connect();
      console.log('Connected to MongoDB');

      const database = client.db('web3');
      const admins = database.collection('admins');

      console.log('Searching for admin:', username);
      const admin = await admins.findOne({ username, password });

      if (admin) {
        console.log('Admin found, generating token');
        const token = sign(
          { username: admin.username, id: admin._id },
          process.env.JWT_SECRET,
          { expiresIn: '1h' }
        );
        res.status(200).json({ success: true, token, walletAddress: admin.walletAddress });
      } else {
        console.log('Admin not found');
        res.status(401).json({ success: false, message: 'Invalid credentials' });
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
