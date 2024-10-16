"use client";
import { useState } from 'react';
import { PerspectiveGrid } from "@/components/ui/perspective-grid";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Button } from "@/components/ui/moving-border-button";
import { Navbar } from "@/components/ui/navbar";
import { connectWallet, donateBNB } from "@/utils/bnbWallet";

export default function Home() {
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  async function handleConnectWallet() {
    try {
      const userAddress = await connectWallet();
      setWalletAddress(userAddress);
      setIsWalletConnected(true);
      setError('');
      alert(`Wallet Connected: ${userAddress}`);
    } catch (error) {
      setError(error.message);
      alert("Failed to connect wallet: " + error.message);
    }
  }

  async function handleDonate() {
    try {
      setError('');
      const txHash = await donateBNB();
      setTxHash(txHash);
      alert(`Donation successful! Transaction hash: ${txHash}`);
    } catch (error) {
      setError(error.message);
      alert("Failed to donate: " + error.message);
    }
  }

  return (
    <div className="relative w-full min-h-screen overflow-hidden">
      <Navbar />

      <PerspectiveGrid />
      
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-16">
        <div className="max-w-4xl w-full space-y-8">
          <h1 className="text-4xl md:text-7xl font-bold text-center text-gray-800 p-4 rounded-lg">
            You have a Wallet <br /> 
            <span className="gradient-text text-black dark:text-white">Now what?</span>
          </h1>
          <div className="w-full p-4 rounded-lg">
            <h2 className="text-xl md:text-3xl font-bold text-gray-600 text-center">
              <TextGenerateEffect words="Join over whales and investors exploring Web3 with us Every day.." />
            </h2>
          </div>
          <div className="flex flex-col items-center justify-center mt-8 space-y-4">
            {!isWalletConnected ? (
              <Button
                className="font-bold text-lg px-8 py-4"
                containerClassName="p-[1px]"
                borderClassName="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                onClick={handleConnectWallet}
              >
                Connect Wallet
              </Button>
            ) : (
              <>
                <p className="text-sm text-gray-600">Connected: {walletAddress}</p>
                <Button
                  className="font-bold text-lg px-8 py-4"
                  containerClassName="p-[1px]"
                  borderClassName="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  onClick={handleDonate}
                >
                  Donate 0.001 BNB
                </Button>
                {txHash && <p className="text-sm text-gray-600">Donation Transaction: {txHash}</p>}
              </>
            )}
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
