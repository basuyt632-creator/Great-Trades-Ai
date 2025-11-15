import React from 'react';

export const FibonacciIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-2 5L9 9l-2 5L3 8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18" />
    </svg>
);