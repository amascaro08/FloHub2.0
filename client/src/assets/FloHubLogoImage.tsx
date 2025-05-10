import React from 'react';
import floHubLogoImg from './images/F5056AE2-59CA-4826-880F-838F1E2C4E5A.png';

interface FloHubLogoImageProps {
  className?: string;
}

export const FloHubLogoImage: React.FC<FloHubLogoImageProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <img 
      src={floHubLogoImg} 
      alt="FloHub Logo" 
      className={className}
    />
  );
};