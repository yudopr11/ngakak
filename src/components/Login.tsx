import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import toast from 'react-hot-toast';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);

    try {
      await login(username, password);
      toast.success('Login successful!', {
        duration: 3000
      });
      navigate('/');
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message, {
          duration: 5000,
          icon: '🔒'
        });
      } else {
        toast.error('Login failed. Please try again.', {
          duration: 5000,
          icon: '❌'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isGuestLoading || isLoading) return; // Prevent multiple submissions
    setIsGuestLoading(true);

    try {
      // Get guest credentials from environment variables
      const guestUsername = import.meta.env.VITE_GUEST_USERNAME;
      const guestPassword = import.meta.env.VITE_GUEST_PASSWORD;
      
      // Fallback to placeholders if env vars are not set (for development)
      if (!guestUsername || !guestPassword) {
        console.warn('VITE_GUEST_USERNAME or VITE_GUEST_PASSWORD environment variables are not set');
      }
      
      await login(guestUsername || 'guest_username', guestPassword || 'placeholder_password');
      toast.success('Logged in as guest', {
        duration: 3000
      });
      navigate('/');
    } catch (error) {
      toast.error('Guest login failed. Please try again.', {
        duration: 5000,
        icon: '❌'
      });
    } finally {
      setIsGuestLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col justify-start items-center pt-24 px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-400 mb-2">Ngakak</h1>
          <p className="text-gray-400">Ngebagi, Gampang, Asyik, Kompak, Aman, Keren</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card">
            <h2 className="text-xl font-semibold mb-6">Login to continue</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-400 mb-1">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field text-white bg-gray-800"
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field text-white bg-gray-800 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="flex items-center justify-center my-4">
            <div className="flex-grow h-px bg-gray-700"></div>
            <span className="px-4 text-sm text-gray-400">OR</span>
            <div className="flex-grow h-px bg-gray-700"></div>
          </div>
          
          <button
            type="button"
            onClick={handleGuestLogin}
            disabled={isGuestLoading || isLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGuestLoading ? 'Logging in as guest...' : 'Continue as Guest'}
          </button>
          
          <p className="text-xs text-gray-400 text-center mt-2">
            Guest accounts have limited usage (3 analyses per day)
          </p>
        </form>
      </div>
    </div>
  );
} 