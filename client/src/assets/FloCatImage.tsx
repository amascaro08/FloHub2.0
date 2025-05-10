import React from 'react';
import floCatImg from './images/flocat_transparent.png';

interface FloCatImageProps {
  className?: string;
}

export const FloCatImage: React.FC<FloCatImageProps> = ({ className = "h-40 w-auto" }) => {
  return (
    <img 
      src={floCatImg} 
      alt="FloCat Mascot" 
      className={className}
    />
  );
};