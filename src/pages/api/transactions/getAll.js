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
      verify(token, process.env.JWT_SECRET);

      await client.connect();
      const database = client.db('web3');
      const transactions = database.collection('transactions');

      const result = await transactions.find().sort({ timestamp: -1 }).toArray();

      res.status(200).json({ success: true, transactions: result });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({ success: false, message: 'Failed to fetch transactions' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
