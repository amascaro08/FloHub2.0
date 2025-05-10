import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

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
              Ready to transform your workflow?
            </h2>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Start your free 14-day trial today. No credit card required. Cancel anytime.
            </p>
            <div className="mt-8">
              <Button asChild variant="secondary" size="lg">
                <a href={dashboardUrl}>
                  Get started now
                </a>
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
            <img 
              src="https://i.imgur.com/X4sR1Ib.png" 
              alt="FloHub Mascot" 
              className="max-h-52 lg:max-h-64" 
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HomeCTA;
