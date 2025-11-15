import React from 'react';

export const ElliottWaveIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13l2-3 2 3 2-3 2 3 2-3 2 3M3 13v6M21 13v6" />
    </svg>
);