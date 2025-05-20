import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { GoogleLogin } from '@react-oauth/google';
import AuthLayout from '@/components/ui/AuthLayout';
import { FloCatImage } from '@/assets/FloCatImage';

const GoogleLoginPage: React.FC = () => {
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session');
        const data = await response.json();
        
        if (data.user) {
          setLocation('/dashboard');
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    
    checkAuth();
  }, [setLocation]);

  const handleGoogleLoginSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    
    try {
      // Send the credential to our backend to verify and create a session
      const response = await fetch('/api/auth/google-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Google authentication failed');
      }
      
      // Redirect to dashboard on success
      setLocation('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to authenticate with Google');
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Google Login">
      <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
        Sign in with Google
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-t-2 border-b-2 border-teal-500 rounded-full animate-spin"></div>
            <p className="mt-2 text-sm text-gray-500">Authenticating...</p>
          </div>
        ) : (
          <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={() => setError('Google login failed')}
            useOneTap
            width="300"
            locale="en"
            text="signin_with"
            shape="pill"
          />
        )}
      </div>
      
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or</span>
          </div>
        </div>

        <div className="mt-6">
          <button 
            onClick={() => setLocation('/login')}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Sign in with Email
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <FloCatImage className="h-20 w-auto" />
      </div>
    </AuthLayout>
  );
};

export default GoogleLoginPage;