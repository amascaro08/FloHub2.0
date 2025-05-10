import React from 'react';
import Navbar from '@/components/Navbar';
import HomeHero from '@/components/HomeHero';
import HomeStats from '@/components/HomeStats';
import HomeFeatures from '@/components/HomeFeatures';
import HomeDashboard from '@/components/HomeDashboard';
import HomePricing from '@/components/HomePricing';
import HomeTestimonials from '@/components/HomeTestimonials';
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
        <HomePricing />
        <HomeTestimonials />
        <HomeCTA />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
