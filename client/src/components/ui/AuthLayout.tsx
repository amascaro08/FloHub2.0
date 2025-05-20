import React, { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { FloHubLogoImage } from '@/components/FloHubLogoImage';

type AuthLayoutProps = {
  children: ReactNode;
  title: string;
};

const AuthLayout = ({ children, title }: AuthLayoutProps) => {
  const [location] = useLocation();
  const isLoginPage = location === '/login';
  const isRegisterPage = location === '/register';

  // Set document title
  React.useEffect(() => {
    document.title = `${title} - FloHub`;
  }, [title]);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--bg)]">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 flex justify-center">
            <Link href="/">
              <FloHubLogoImage className="h-16 w-auto" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-lg bg-white shadow-lg">
            <div className="flex border-b border-gray-200">
              <Link
                href="/login"
                className={`flex-1 px-4 py-3 text-center font-medium ${
                  isLoginPage
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Login
              </Link>
              <Link
                href="/register"
                className={`flex-1 px-4 py-3 text-center font-medium ${
                  isRegisterPage
                    ? 'bg-teal-50 text-teal-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Register
              </Link>
            </div>

            <div className="p-8">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;