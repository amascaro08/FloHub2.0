import React from 'react';
import { motion } from 'framer-motion';

const HomeDashboard: React.FC = () => {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Dashboard</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Intuitive workflow management</p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Our clean, modern dashboard provides a clear view of your day, calendar, tasks, and habit tracking in one organized interface.
          </p>
        </motion.div>
        
        <motion.div 
          className="mt-12 relative"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <div className="relative mx-auto rounded-xl shadow-2xl overflow-hidden bg-white">
            <img 
              src="/client/public/assets/IMG_0015.png" 
              alt="FloHub Dashboard Interface" 
              className="w-full mx-auto shadow-lg"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeDashboard;
