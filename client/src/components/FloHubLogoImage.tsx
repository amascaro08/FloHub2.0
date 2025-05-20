import React from 'react';

interface FloHubLogoImageProps {
  className?: string;
}

export const FloHubLogoImage: React.FC<FloHubLogoImageProps> = ({ className }) => {
  return (
    <div className={`text-3xl font-bold ${className}`}>
      <span className="text-teal-600">Flo</span>
      <span className="text-orange-500">Hub</span>
    </div>
  );
};