import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      await client.connect();
      const database = client.db('web3');
      const admins = database.collection('admins');

      // Get the first admin's wallet address (or implement your own logic)
      const admin = await admins.findOne({});

      if (admin && admin.walletAddress) {
        res.status(200).json({ walletAddress: admin.walletAddress });
      } else {
        res.status(404).json({ success: false, message: 'Admin wallet not found' });
      }
    } catch (error) {
      console.error('Server error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
