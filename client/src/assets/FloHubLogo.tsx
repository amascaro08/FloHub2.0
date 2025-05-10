import React from 'react';

interface FloHubLogoProps {
  className?: string;
}

export const FloHubLogo: React.FC<FloHubLogoProps> = ({ className = "h-8 w-auto" }) => {
  return (
    <svg 
      width="200" 
      height="50" 
      viewBox="0 0 200 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g>
        {/* Circle and F design */}
        <path d="M33.5 50C43.165 50 50 43.165 50 33.5C50 23.835 43.165 17 33.5 17C23.835 17 17 23.835 17 33.5C17 43.165 23.835 50 33.5 50Z" fill="#0CC6B8" />
        <path d="M28.5 31H36.5V34H31.5V37H35.5V40H31.5V46H28.5V31Z" fill="white" />
        
        {/* Drop shape */}
        <path d="M37 17C37 22.523 32.523 27 27 27C21.477 27 17 22.523 17 17C17 11.477 21.477 7 27 7C32.523 7 37 11.477 37 17Z" fill="#FF8A76" />
        
        {/* Text "FloHub" */}
        <path d="M70 20H74V33H83V37H70V20Z" fill="#0CC6B8" />
        <path d="M85 20H89V37H85V20Z" fill="#0CC6B8" />
        <path d="M92 29C92 24 96 19.5 101.5 19.5C107 19.5 111 23.5 111 29C111 34.5 107 38.5 101.5 38.5C96 38.5 92 34 92 29ZM107 29C107 25.5 104.5 23 101.5 23C98.5 23 96 25.5 96 29C96 32.5 98.5 35 101.5 35C104.5 35 107 32.5 107 29Z" fill="#0CC6B8" />
        <path d="M115 20H119V22.5C119.833 21.167 121.5 19.5 124.5 19.5C129 19.5 132 23 132 28V37H128V28.5C128 25.5 126.5 23.5 123.5 23.5C120.5 23.5 119 25.5 119 28.5V37H115V20Z" fill="#FF8A76" />
        <path d="M135 28.5C135 23.5 139 19.5 144.5 19.5C150 19.5 154 23 154 28.5C154 34 150 38 144.5 38C139 38 135 33.5 135 28.5ZM150 28.5C150 25.5 147.5 23 144.5 23C141.5 23 139 25.5 139 28.5C139 31.5 141.5 34 144.5 34C147.5 34 150 31.5 150 28.5Z" fill="#FF8A76" />
        <path d="M162 24H159V21H162V17L166 15V21H170V24H166V31.5C166 33 167 34 168.5 34H170V37.5H168C164.5 37.5 162 35.5 162 31.5V24Z" fill="#FF8A76" />
      </g>
    </svg>
  );
};
