import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface DashboardHeaderProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userName, 
  userEmail,
  onLogout
}) => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between"
    >
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-teal-600">Flo<span className="text-orange-500">Hub</span></h1>
        <span className="ml-2 text-sm text-gray-600">Dashboard</span>
      </div>

      <div className="flex items-center space-x-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{userName}</p>
          <p className="text-xs text-gray-500">{userEmail}</p>
        </div>
        <Button variant="outline" onClick={onLogout}>Sign out</Button>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;