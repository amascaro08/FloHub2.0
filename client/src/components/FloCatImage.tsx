import React from 'react';

interface FloCatImageProps {
  className?: string;
}

export const FloCatImage: React.FC<FloCatImageProps> = ({ className }) => {
  return (
    <div className={`text-4xl flex justify-center items-center ${className}`}>
      <span role="img" aria-label="FloCat" className="bg-orange-100 rounded-full p-4">
        😺
      </span>
    </div>
  );
};