import React from 'react';
import Navbar from '@/components/Navbar';
import HomeHero from '@/components/HomeHero';
import HomeStats from '@/components/HomeStats';
import HomeFeatures from '@/components/HomeFeatures';
import HomeDashboard from '@/components/HomeDashboard';
import HomeCTA from '@/components/HomeCTA';
import Footer from '@/components/Footer';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main>
        <HomeHero />
        <HomeStats />
        <HomeFeatures />
        <HomeDashboard />
        <HomeCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
