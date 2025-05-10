import React from 'react';

interface FloCatImageProps {
  className?: string;
}

export const FloCatImage: React.FC<FloCatImageProps> = ({ className = "h-40 w-auto" }) => {
  return (
    <img 
      src="/client/public/assets/D5EE21D3-A261-4A85-A439-17CE55AA1A7B.png" 
      alt="FloCat Mascot" 
      className={className}
    />
  );
};