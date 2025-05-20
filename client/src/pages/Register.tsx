import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';

// Form validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  hasGmail: z.boolean().default(false),
  gmailAccount: z.string().optional(),
  devices: z.array(z.string()).min(1, 'Please select at least one device'),
  role: z.string().min(1, 'Please select your role'),
  why: z.string().min(10, 'Please tell us a bit more about why you want to join')
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
  const [, setLocation] = useLocation();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      email: '',
      hasGmail: false,
      gmailAccount: '',
      devices: [],
      role: '',
      why: ''
    },
  });

  const hasGmail = watch('hasGmail');

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        setSuccess(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred during registration. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <FloHubLogoImage className="h-16 w-auto" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registration Successful!
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <div className="mb-6">
              <FloCatImage className="h-24 w-auto mx-auto" />
            </div>
            
            <p className="text-lg text-gray-700 mb-4">
              Thank you for registering for FloHub!
            </p>
            
            <p className="text-sm text-gray-600 mb-6">
              We've sent a confirmation email to your inbox. Beta testing will begin in July 2025.
              Please check your spam folder if you don't see the email.
            </p>
            
            <p className="text-sm text-gray-600 mb-6">
              Stay updated on our progress by visiting the <a href="/updates" className="text-teal-600 hover:text-teal-500 font-medium">updates page</a>.
            </p>
            
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={() => setLocation('/')}
              >
                Return to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <FloHubLogoImage className="h-16 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Register for FloHub Beta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Join our exclusive beta testing program
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
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

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Your Name
              </label>
              <div className="mt-1">
                <input
                  id="firstName"
                  type="text"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="John Doe"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="you@example.com"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  id="hasGmail"
                  type="checkbox"
                  className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  {...register('hasGmail')}
                />
                <label htmlFor="hasGmail" className="ml-2 block text-sm text-gray-700">
                  I have a Gmail account
                </label>
              </div>
            </div>

            {hasGmail && (
              <div>
                <label htmlFor="gmailAccount" className="block text-sm font-medium text-gray-700">
                  Your Gmail Address
                </label>
                <div className="mt-1">
                  <input
                    id="gmailAccount"
                    type="email"
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                    placeholder="you@gmail.com"
                    {...register('gmailAccount')}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Which devices do you use?
              </label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="device-desktop"
                    type="checkbox"
                    value="desktop"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    {...register('devices')}
                  />
                  <label htmlFor="device-desktop" className="ml-2 block text-sm text-gray-700">
                    Desktop Computer
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="device-laptop"
                    type="checkbox"
                    value="laptop"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    {...register('devices')}
                  />
                  <label htmlFor="device-laptop" className="ml-2 block text-sm text-gray-700">
                    Laptop
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="device-tablet"
                    type="checkbox"
                    value="tablet"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    {...register('devices')}
                  />
                  <label htmlFor="device-tablet" className="ml-2 block text-sm text-gray-700">
                    Tablet
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="device-phone"
                    type="checkbox"
                    value="phone"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    {...register('devices')}
                  />
                  <label htmlFor="device-phone" className="ml-2 block text-sm text-gray-700">
                    Smartphone
                  </label>
                </div>
              </div>
              {errors.devices && (
                <p className="mt-1 text-sm text-red-600">{errors.devices.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                What best describes you?
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  {...register('role')}
                >
                  <option value="">Select your role</option>
                  <option value="student">Student</option>
                  <option value="professional">Professional</option>
                  <option value="entrepreneur">Entrepreneur</option>
                  <option value="educator">Educator</option>
                  <option value="other">Other</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="why" className="block text-sm font-medium text-gray-700">
                Why are you interested in FloHub?
              </label>
              <div className="mt-1">
                <textarea
                  id="why"
                  rows={4}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder="Tell us why you're excited to try FloHub..."
                  {...register('why')}
                ></textarea>
                {errors.why && (
                  <p className="mt-1 text-sm text-red-600">{errors.why.message}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Register for Beta Access'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation('/')}
              >
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;