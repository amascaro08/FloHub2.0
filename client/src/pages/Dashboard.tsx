import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { MobileDashboard } from '@/components/dashboard/MobileDashboard';

export default function Dashboard() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the viewport width is mobile-sized
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkMobile();

    // Add resize listener
    window.addEventListener('resize', checkMobile);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <DashboardLayout>
      {isMobile ? <MobileDashboard /> : <DashboardGrid />}
    </DashboardLayout>
  );
}
