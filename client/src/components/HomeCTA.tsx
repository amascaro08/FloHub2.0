import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FloCatImage } from '@/assets/FloCatImage';
import { Link } from 'wouter';

const HomeCTA: React.FC = () => {
  const dashboardUrl = "https://flow-hubdev.vercel.app/dashboard";
  
  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Ready to transform your productivity?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              FloHub is currently in testing. Register your interest today to join our exclusive beta program and be among the first to experience this AI-powered productivity tool.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild variant="secondary" size="lg">
                <a href={dashboardUrl}>
                  Log in to Dashboard
                </a>
              </Button>
              <Button 
                asChild
                variant="outline" 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
              >
                <Link href="/register">
                  Register for Testing
                </Link>
              </Button>
            </div>
          </motion.div>
          <motion.div 
            className="mt-10 lg:mt-0 flex justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <FloCatImage className="max-h-52 lg:max-h-64" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;
