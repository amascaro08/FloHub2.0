import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FloCatImage } from '@/assets/FloCatImage';
import { motion } from 'framer-motion';
import { apiRequest } from '@/lib/queryClient';

const formSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  gmailAccount: z.string().email({
    message: "Please enter a valid Gmail address.",
  }).refine(email => email.endsWith('@gmail.com'), {
    message: "Please enter a valid Gmail address ending with @gmail.com",
  }).optional().or(z.literal('')),
  hasGmail: z.boolean().default(false),
  devices: z.array(z.string()).min(1, {
    message: "Please select at least one device.",
  }),
  role: z.string().min(2, {
    message: "Please tell us your role or profession.",
  }),
  why: z.string().min(10, {
    message: "Please tell us a bit more about why you're interested.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const Register: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      email: "",
      gmailAccount: "",
      hasGmail: false,
      devices: [],
      role: "",
      why: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // If hasGmail is false, make sure gmailAccount is empty
      if (!data.hasGmail) {
        data.gmailAccount = "";
      }
      
      const response = await apiRequest(
        'POST',
        '/api/register',
        data
      );
      
      // Handle the case where the user is already registered
      // The API now returns 200 in this case with a specific message
      if (response && typeof response === 'object' && 'message' in response) {
        toast({
          title: "Already Registered",
          description: response.message as string,
          variant: "default",
        });
      }
      
      // Show success screen
      setRegistrationSuccess(true);
      form.reset();
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration failed",
        description: "There was an error submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {registrationSuccess ? (
            <motion.div 
              className="bg-white shadow rounded-lg overflow-hidden p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
                <p className="text-lg text-gray-600 mb-6">
                  Thank you for your interest in testing FloHub!
                </p>
                <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">What's Next?</h3>
                  <p className="text-blue-800 mb-3">
                    We're preparing for our beta testing phase, which will begin in July 2025. Here's what you can expect:
                  </p>
                  <ul className="list-disc pl-5 text-blue-800 space-y-2">
                    <li>You'll receive an email confirmation of your registration shortly.</li>
                    <li>We'll notify you with instructions when the testing phase begins.</li>
                    <li>Early testers will get exclusive access to premium features.</li>
                    <li>Your feedback will directly shape the future of FloHub.</li>
                  </ul>
                </div>
                <div className="flex justify-center space-x-4">
                  <Button asChild variant="outline">
                    <a href="/">Return to Home</a>
                  </Button>
                  <Button asChild>
                    <a href="https://flow-hubdev.vercel.app/dashboard">Visit Demo</a>
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/2 bg-primary p-8 flex flex-col justify-center items-center text-white">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <FloCatImage className="h-40 w-auto mx-auto mb-6" />
                  </motion.div>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h2 className="text-2xl font-bold mb-4 text-center">Join Our Testing Program</h2>
                    <p className="text-gray-100 text-center">
                      Help us improve FloHub by becoming an early tester. Get exclusive access and shape
                      the future of this AI-powered productivity dashboard.
                    </p>
                  </motion.div>
                </div>
                
                <div className="md:w-1/2 p-8">
                  <h3 className="text-xl font-medium mb-6">Register Your Interest</h3>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your preferred first name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input placeholder="you@example.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="hasGmail"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl>
                              <input
                                type="checkbox"
                                className="h-4 w-4 mt-1 accent-primary"
                                checked={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>I have a Gmail account</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      {form.watch("hasGmail") && (
                        <FormField
                          control={form.control}
                          name="gmailAccount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Gmail Address</FormLabel>
                              <FormControl>
                                <Input placeholder="yourname@gmail.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                      
                      <FormField
                        control={form.control}
                        name="devices"
                        render={() => (
                          <FormItem>
                            <div className="mb-2">
                              <FormLabel>Devices You'll Use for Testing</FormLabel>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {["iPhone", "Android Phone", "iPad/Tablet", "Mac", "Windows PC", "Linux"].map((device) => (
                                <FormField
                                  key={device}
                                  control={form.control}
                                  name="devices"
                                  render={({ field }) => {
                                    return (
                                      <FormItem
                                        key={device}
                                        className="flex flex-row items-start space-x-3 space-y-0"
                                      >
                                        <FormControl>
                                          <input
                                            type="checkbox"
                                            className="h-4 w-4 mt-1 accent-primary"
                                            checked={field.value?.includes(device)}
                                            onChange={(e) => {
                                              return e.target.checked
                                                ? field.onChange([...field.value, device])
                                                : field.onChange(
                                                    field.value?.filter(
                                                      (value) => value !== device
                                                    )
                                                  )
                                            }}
                                          />
                                        </FormControl>
                                        <FormLabel className="text-sm font-normal">
                                          {device}
                                        </FormLabel>
                                      </FormItem>
                                    )
                                  }}
                                />
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Role/Profession</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Project Manager, Designer, Developer" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="why"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Why are you interested in FloHub?</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Tell us what caught your interest and how you hope to use FloHub..." 
                                className="resize-none min-h-[100px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Submitting..." : "Submit Registration"}
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;