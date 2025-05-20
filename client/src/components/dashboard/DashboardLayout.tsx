import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default DashboardLayout;