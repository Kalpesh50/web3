import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState('');
  const [currentWalletAddress, setCurrentWalletAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      try {
        // Verify token validity by making a request to a protected endpoint
        await axios.get('/api/admin/verifyToken', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsAuthenticated(true);
        fetchWalletAddress(token);
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('adminToken');
        router.push('/admin/login');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTransactions();
    }
  }, [isAuthenticated]);

  const fetchWalletAddress = async (token) => {
    try {
      const response = await axios.get('/api/admin/getWallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentWalletAddress(response.data.walletAddress || '');
      setWalletAddress(response.data.walletAddress || '');
    } catch (error) {
      console.error('Failed to fetch wallet address:', error);
      setMessage('Failed to fetch current wallet address');
    }
  };

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/transactions/getAll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setMessage('Failed to fetch transactions');
    }
  };

  const handleUpdateWallet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.post('/api/admin/updateWallet', 
        { walletAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setCurrentWalletAddress(walletAddress);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleTokenExpired();
      } else {
        setMessage(error.response?.data?.message || 'Failed to update wallet address');
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      const response = await axios.post('/api/admin/updatePassword', 
        { newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(response.data.message);
      setNewPassword('');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleTokenExpired();
      } else {
        setMessage(error.response?.data?.message || 'Failed to update password');
      }
    }
  };

  const handleTokenExpired = () => {
    localStorage.removeItem('adminToken');
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null; // or a custom unauthorized message
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl xl:max-w-6xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-semibold mb-6 text-indigo-600">Admin Panel</h1>
            
            <div className="mb-8 p-4 bg-indigo-50 rounded-lg">
              <h2 className="text-lg font-medium text-indigo-800">Current Admin Wallet Address:</h2>
              <p className="mt-2 text-sm text-indigo-600 break-all">{currentWalletAddress || 'Not set'}</p>
            </div>

            <form onSubmit={handleUpdateWallet} className="mb-8">
              <div className="mb-4">
                <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700">
                  Update Admin Wallet Address
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              >
                Update Wallet Address
              </button>
            </form>

            <form onSubmit={handleUpdatePassword} className="mb-8">
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
              >
                Update Password
              </button>
            </form>

            {message && <p className="mt-4 text-sm text-green-600 bg-green-100 p-2 rounded">{message}</p>}

            <h2 className="text-2xl font-semibold mt-12 mb-4 text-indigo-600">Transaction History</h2>
            <div className="overflow-x-auto shadow-md rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-indigo-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">User Address</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Currency</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-800 uppercase tracking-wider">Transaction Hash</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-indigo-50' : 'bg-white'}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.userAddress}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.currency}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 break-all">{tx.txHash}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
