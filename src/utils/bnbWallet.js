import { ethers } from 'ethers';

let provider;
let signer;

const adminWallet = "0x20274614e28038E3085828DDA33e10ed33e8c7f9"; // Your admin wallet address
const DONATION_AMOUNT = "0.001"; // Fixed donation amount in BNB

const BSC_TESTNET_PARAMS = {
  chainId: '0x61', // 97 in decimal
  chainName: 'Binance Smart Chain Testnet',
  nativeCurrency: {
    name: 'tBNB',
    symbol: 'tBNB',
    decimals: 18
  },
  rpcUrls: ['https://data-seed-prebsc-1-s1.binance.org:8545/'],
  blockExplorerUrls: ['https://testnet.bscscan.com/']
};

async function ensureBSCTestnet() {
  if (window.ethereum.networkVersion !== '97') {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET_PARAMS.chainId }],
      });
    } catch (switchError) {
      console.error("Switch network error:", switchError);
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_TESTNET_PARAMS],
          });
        } catch (addError) {
          console.error("Add network error:", addError);
          throw new Error("Failed to add BSC Testnet to wallet");
        }
      } else {
        throw new Error("Failed to switch to BSC Testnet");
      }
    }
  }
}

export async function connectWallet() {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // First, try to switch to BSC Testnet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: BSC_TESTNET_PARAMS.chainId }],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [BSC_TESTNET_PARAMS],
          });
        } else {
          throw switchError;
        }
      }

      // Now request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      provider = new ethers.BrowserProvider(window.ethereum, "any");
      signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      // Verify that we're on the correct network
      const network = await provider.getNetwork();
      if (network.chainId !== BigInt(97)) { // 97 is the chain ID for BSC Testnet
        throw new Error("Please switch to the Binance Smart Chain Testnet");
      }

      // Listen for network changes
      window.ethereum.on('chainChanged', (chainId) => {
        if (chainId !== '0x61') {
          alert("Please switch back to Binance Smart Chain Testnet");
          ensureBSCTestnet();
        }
      });

      return userAddress;
    } catch (error) {
      console.error("Wallet connection error:", error);
      throw error;
    }
  } else {
    throw new Error("Please install a Web3 wallet like MetaMask");
  }
}

export async function donateBNB() {
  try {
    if (!signer) {
      throw new Error("Please connect your wallet first.");
    }

    await ensureBSCTestnet();

    const balance = await provider.getBalance(await signer.getAddress());
    console.log("Current balance:", ethers.formatEther(balance));

    if (balance < ethers.parseEther(DONATION_AMOUNT)) {
      throw new Error("Insufficient balance to make the donation");
    }

    const tx = await signer.sendTransaction({
      to: adminWallet,
      value: ethers.parseEther(DONATION_AMOUNT)
    });

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    return tx.hash;
  } catch (error) {
    console.error("Donation failed:", error);
    if (error.reason) {
      throw new Error(`Donation failed: ${error.reason}`);
    } else {
      throw error;
    }
  }
}
