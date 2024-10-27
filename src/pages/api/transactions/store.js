import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { userAddress, amount, txHash, currency } = req.body;

    try {
      await client.connect();
      const database = client.db('web3');
      const transactions = database.collection('transactions');

      const result = await transactions.insertOne({
        userAddress,
        amount,
        txHash,
        currency,
        timestamp: new Date()
      });

      res.status(200).json({ success: true, message: 'Transaction stored successfully' });
    } catch (error) {
      console.error('Failed to store transaction:', error);
      res.status(500).json({ success: false, message: 'Failed to store transaction' });
    } finally {
      await client.close();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
