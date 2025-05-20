import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface WidgetGridProps {
  children: ReactNode;
}

const WidgetGrid: React.FC<WidgetGridProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6"
    >
      {children}
    </motion.div>
  );
};

export default WidgetGrid;