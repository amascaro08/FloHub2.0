import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FloCatImage } from '@/assets/FloCatImage';
import RegisterInterestModal from './RegisterInterestModal';

const HomeCTA: React.FC = () => {
  const dashboardUrl = "https://flow-hubdev.vercel.app/dashboard";
  const [modalOpen, setModalOpen] = useState(false);
  
  return (
    <section className="py-16 bg-primary">
      <RegisterInterestModal 
        open={modalOpen} 
        onOpenChange={setModalOpen} 
      />
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
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild variant="secondary" size="lg">
                <a href={dashboardUrl}>
                  Log in to Dashboard
                </a>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90"
                onClick={() => setModalOpen(true)}
              >
                Register Interest
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
