import React from 'react';

export function FloHubLogoImage({ className = "h-10", alt = "FloHub Logo" }) {
  return (
    <img
      src="/attached_assets/FloHub_Logo_Transparent.png"
      alt={alt}
      className={className}
    />
  );
}