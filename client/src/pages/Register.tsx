import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [device, setDevice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = "Register for Beta - FloHub";
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email is Gmail
    if (!email.toLowerCase().endsWith('@gmail.com')) {
      setError('Please use a Gmail address for the beta program');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          device,
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 p-4">
        <div className="max-w-md w-full mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center mb-6">
              <img
                src="/attached_assets/FloHub_Logo_Transparent.png"
                alt="FloHub Logo"
                className="h-16 mx-auto mb-4"
              />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Registration Successful!</h2>
              <div className="flex justify-center mt-6 mb-4">
                <svg className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4 text-center">
              <p className="text-gray-700 dark:text-gray-300">
                Thank you for registering for the FloHub beta program! We've sent a confirmation email to <span className="font-medium">{email}</span>.
              </p>
              
              <div className="bg-primary-50 dark:bg-primary-900/20 rounded-md p-4 mt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>Important:</strong> Please check your spam folder if you don't see the email in your inbox.
                </p>
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mt-4">
                The beta testing program will begin in July 2025. We'll notify you with full details before the launch.
              </p>
              
              <p className="text-gray-700 dark:text-gray-300 mt-2">
                Be sure to check out our <span onClick={() => window.location.href = '/updates'} className="text-primary-600 dark:text-primary-400 font-medium hover:underline cursor-pointer">updates page</span> for the latest news about FloHub.
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/">
            <a className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
              ← Back to home
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 p-4">
      <div className="max-w-md w-full mx-auto bg-white dark:bg-neutral-800 rounded-lg shadow-xl overflow-hidden">
        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <img
              src="/attached_assets/FloHub_Logo_Transparent.png"
              alt="FloHub Logo"
              className="h-16 mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Register for Beta Access</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Join our beta testing program</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 p-3 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
                placeholder="Jane Doe"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Gmail Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
                placeholder="your.name@gmail.com"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Gmail required for Google integration features
              </p>
            </div>
            
            <div>
              <label htmlFor="device" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Primary Device
              </label>
              <select
                id="device"
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-700 dark:text-white"
                required
              >
                <option value="">Select your primary device</option>
                <option value="Android Phone">Android Phone</option>
                <option value="iPhone">iPhone</option>
                <option value="iPad">iPad</option>
                <option value="Mac">Mac</option>
                <option value="Windows PC">Windows PC</option>
                <option value="Linux">Linux</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70"
            >
              {loading ? 'Registering...' : 'Register for Beta'}
            </button>
            
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
              By registering, you agree to our{' '}
              <Link href="/terms-of-service">
                <a className="text-primary-600 dark:text-primary-400 hover:underline">Terms of Service</a>
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy">
                <a className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</a>
              </Link>
            </p>
          </form>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <Link href="/">
          <a className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
            ← Back to home
          </a>
        </Link>
      </div>
    </div>
  );
}