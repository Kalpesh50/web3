"use client";
import { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';

export default function AdminPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post('/api/admin/login', { username, password });
      if (response.data.success) {
        // Redirect to admin dashboard or show success message
        alert('Login successful!');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-black via-black to-yellow-900 text-yellow-300 overflow-hidden font-oxanium">
      <div className="absolute inset-0 z-0">
        <Image
          src="/Blockchain-DeFi.gif"
          alt="Blockchain DeFi Background"
          layout="fill"
          objectFit="cover"
          className="opacity-60"
        />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <h2 className="text-2xl font-bold text-center text-black">Admin Login</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
          <button type="submit" className="w-full bg-black text-white p-2 rounded">
            Login
          </button>
          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
