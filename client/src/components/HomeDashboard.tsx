import React from 'react';
import { motion } from 'framer-motion';
import dashboardImg from '../assets/images/IMG_0015.png';
import floCatPeekingSideImg from '../assets/images/flocat-peeking-side.png';

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
          <h2 className="text-base font-semibold text-primary uppercase tracking-wide">Unified Dashboard</h2>
          <p className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Everything in one place</p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
            Combine multiple apps into one with our customizable, drag-and-drop interface featuring daily summaries, calendar, tasks, notes, and habit tracking — all enhanced by FloCat's intelligent assistance.
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
              src={dashboardImg} 
              alt="FloHub Dashboard Interface" 
              className="w-full mx-auto shadow-lg"
            />
            <motion.img 
              src={floCatPeekingSideImg} 
              alt="FloCat Peeking" 
              className="absolute -right-1 bottom-0 h-36 md:h-48 lg:h-56 z-10"
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ 
                duration: 0.8,
                delay: 0.6,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HomeDashboard;
