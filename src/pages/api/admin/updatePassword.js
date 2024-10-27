import { MongoClient } from 'mongodb';
import { verify } from 'jsonwebtoken';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { newPassword } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
      const decoded = verify(token, process.env.JWT_SECRET);
      await client.connect();
      const database = client.db('web3');
      const admins = database.collection('admins');

      const result = await admins.updateOne(
        { username: decoded.username },
        { $set: { password: newPassword } }
      );

      if (result.modifiedCount === 1) {
        res.status(200).json({ success: true, message: 'Password updated successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Failed to update password' });
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
