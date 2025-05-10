import React from 'react';
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

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
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
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      why: "",
    },
  });

  const onSubmit = (data: FormValues) => {
    // In a real app, this would send the data to a backend
    console.log(data);
    toast({
      title: "Registration received!",
      description: "Thank you for your interest in testing FloHub. We'll be in touch soon!",
    });
    form.reset();
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" type="email" {...field} />
                          </FormControl>
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
                    
                    <Button type="submit" className="w-full">Submit Registration</Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Register;