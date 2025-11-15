import React from 'react';

export const MovingAverageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19C5.13401 19 2 15.866 2 12C2 8.13401 5.13401 5 9 5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 5C18.866 5 22 8.13401 22 12C22 15.866 18.866 19 15 19" />
    </svg>
);
