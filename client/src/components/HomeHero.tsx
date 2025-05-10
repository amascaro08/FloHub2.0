import React from 'react';
import { Button } from '@/components/ui/button';
import { useMotionValue, motion, useTransform } from 'framer-motion';

const HomeHero: React.FC = () => {
  const dashboardUrl = "https://flow-hubdev.vercel.app/dashboard";
  const y = useMotionValue(0);
  const opacity = useTransform(y, [-100, 0, 100], [0.5, 1, 0.5]);

  return (
    <section className="hero-gradient pt-16 pb-24 sm:pt-24 sm:pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left lg:flex lg:flex-col lg:justify-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Streamline your</span>
              <span className="block text-primary">workflow with FloHub</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
              The all-in-one platform that helps teams manage projects, track progress, and automate workflows with powerful integrations.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
              <div className="flex flex-col sm:flex-row sm:justify-center lg:justify-start gap-4">
                <Button asChild size="lg" className="px-8">
                  <a href={dashboardUrl}>Get started</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="group px-8">
                  <a href="#features" className="flex items-center">
                    Learn more
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 ml-2 transform transition-transform group-hover:translate-y-1" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  </a>
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-12 lg:mt-0 lg:col-span-6 flex justify-center items-center">
            <motion.div 
              style={{ y, opacity }}
              animate={{ 
                y: [0, -10, 0],
              }}
              transition={{ 
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut" 
              }}
            >
              <img 
                src="https://i.imgur.com/X4sR1Ib.png" 
                alt="FloHub Mascot - FloKit" 
                className="max-h-80 lg:max-h-96" 
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeHero;
