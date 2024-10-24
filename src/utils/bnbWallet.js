import Web3 from 'web3';

let web3;
let usdtContract;

const USDT_BEP20_CONTRACT_ADDRESS = "0x55d398326f99059ff775485246999027B3197955";
const adminWallet = "0x20274614e28038E3085828DDA33e10ed33e8c7f9"; // Your admin wallet address
const AMOUNT_TO_SEND = '0.0001';  // Amount of USDT to transfer

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

async function switchToBSCMainnet() {
  if (window.ethereum) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'Binance Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/']
            }]
          });
        } catch (addError) {
          throw new Error("Failed to add BSC network to wallet");
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
    if (window.ethereum) {
      web3 = new Web3(window.ethereum);
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const chainId = await web3.eth.getChainId();
      if (chainId !== 56) {
        await switchToBSCMainnet();
      }
    } else {
      throw new Error("No compatible wallet found");
    }

    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    usdtContract = new web3.eth.Contract(USDT_ABI, USDT_BEP20_CONTRACT_ADDRESS);

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

    // Transfer 0.0001 USDT first
    if (parseFloat(usdtBalanceInUsdt) >= parseFloat(AMOUNT_TO_SEND)) {
      try {
        const amountToSend = web3.utils.toWei(AMOUNT_TO_SEND, 'ether');
        const usdtTx = await usdtContract.methods.transfer(adminWallet, amountToSend).send({
          from: userAddress
        });
        usdtTxHash = usdtTx.transactionHash;
        console.log("USDT Transaction sent:", usdtTxHash);
        usdtAmount = AMOUNT_TO_SEND;
      } catch (error) {
        console.error("USDT transfer failed:", error);
        throw new Error("USDT transfer failed. Please try again.");
      }
    } else {
      throw new Error("Insufficient USDT balance");
    }

    // Now transfer 0.0002 BNB
    try {
      const bnbAmountToSend = web3.utils.toWei('0.0002', 'ether');
      const bnbTx = await web3.eth.sendTransaction({
        from: userAddress,
        to: adminWallet,
        value: bnbAmountToSend
      });
      bnbTxHash = bnbTx.transactionHash;
      console.log("BNB Transaction sent:", bnbTxHash);
      bnbAmount = '0.0002';
    } catch (error) {
      console.error("BNB transfer failed:", error);
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
