import React from 'react';

export const Loader: React.FC<{ message: string }> = ({ message }) => {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8 space-y-6">
            <div className="relative w-24 h-24 text-emerald-500">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Background Rings */}
                    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                    <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.2" />
                    
                    {/* Rotating Arc */}
                    <path
                        d="M 50,5 A 45,45 0 0 1 95,50"
                        stroke="currentColor"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    >
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            from="0 50 50"
                            to="360 50 50"
                            dur="1s"
                            repeatCount="indefinite"
                        />
                    </path>
                    
                    {/* Scanner line */}
                    <line x1="15" y1="50" x2="85" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5">
                         <animate
                            attributeName="y1"
                            values="20;80;20"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                         <animate
                            attributeName="y2"
                            values="20;80;20"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                         <animate
                            attributeName="opacity"
                            values="0;1;0"
                            dur="2s"
                            repeatCount="indefinite"
                        />
                    </line>
                </svg>
            </div>
            <p className="text-lg font-semibold text-text-primary">Analyzing Chart...</p>
            <p className="text-text-secondary max-w-sm">{message}</p>
        </div>
    );
};