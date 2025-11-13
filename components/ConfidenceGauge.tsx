import React, { useState, useEffect, useRef } from 'react';

interface ConfidenceGaugeProps {
    confidence: number;
}

export const ConfidenceGauge: React.FC<ConfidenceGaugeProps> = ({ confidence }) => {
    const [displayConfidence, setDisplayConfidence] = useState(0);
    const gaugeRef = useRef<HTMLDivElement>(null);
    const animationFrameId = useRef<number>();

    useEffect(() => {
        let startTimestamp: number | null = null;
        const duration = 1000; // 1 second animation
        const startValue = 0;
        const endValue = confidence;

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const currentValue = Math.floor(progress * (endValue - startValue) + startValue);
            
            setDisplayConfidence(currentValue);

            if (progress < 1) {
                animationFrameId.current = requestAnimationFrame(step);
            }
        };

        // Only start animation when component is visible
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (animationFrameId.current) {
                    cancelAnimationFrame(animationFrameId.current);
                }
                animationFrameId.current = requestAnimationFrame(step);
                observer.disconnect();
            }
        }, { threshold: 0.5 });
        
        if (gaugeRef.current) {
            observer.observe(gaugeRef.current);
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            observer.disconnect();
        };

    }, [confidence]);


    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (displayConfidence / 100) * circumference;

    const getColor = (value: number) => {
        if (value < 40) return 'text-red-500';
        if (value < 70) return 'text-yellow-500';
        return 'text-green-500';
    };
    
    const colorClass = getColor(confidence); // Color is based on final value

    return (
        <div ref={gaugeRef} className="relative flex items-center justify-center w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    className="text-slate-700 dark:text-slate-700 light:text-slate-200"
                    strokeWidth="8"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                />
                <circle
                    className={colorClass}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                    style={{ transition: 'stroke-dashoffset 0.3s linear' }}
                />
            </svg>
            <span className={`absolute text-3xl font-bold ${colorClass}`}>
                {displayConfidence}%
            </span>
        </div>
    );
};