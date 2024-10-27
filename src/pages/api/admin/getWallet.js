import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      await client.connect();
      const database = client.db('web3');
      const admins = database.collection('admins');

      const admin = await admins.findOne({ username: decoded.username });

      if (admin) {
        res.status(200).json({ success: true, walletAddress: admin.walletAddress });
      } else {
        res.status(404).json({ success: false, message: 'Admin not found' });
      }
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
