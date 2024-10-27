import { ethers } from 'ethers';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { userAddress, amount } = req.body;
    
    // Create provider and wallet
    const provider = new ethers.JsonRpcProvider('https://bsc-dataseed1.binance.org');
    const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

    // Send BNB
    const tx = await adminWallet.sendTransaction({
      to: userAddress,
      value: amount
    });

    await tx.wait();

    res.status(200).json({ 
      success: true, 
      hash: tx.hash 
    });
  } catch (error) {
    console.error('Error sending gas fees:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
