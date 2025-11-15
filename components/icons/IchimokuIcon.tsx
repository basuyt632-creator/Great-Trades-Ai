import React from 'react';

export const IchimokuIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 005-5v-2a1 1 0 00-1-1H4a1 1 0 00-1 1v2z" opacity="0.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
    </svg>
);