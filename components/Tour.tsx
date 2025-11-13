import React, { useState, useEffect } from 'react';

const TOUR_STEPS = [
    {
        title: 'Welcome to Great Trades AI!',
        content: "Let's take a quick tour to see how you can get AI-powered insights on your trading charts.",
        position: 'center',
    },
    {
        targetId: 'tour-step-2',
        title: 'Upload Your Charts',
        content: 'Click here, or drag and drop chart images to get started. You can even paste from your clipboard!',
        position: 'bottom',
    },
    {
        targetId: 'tour-step-3',
        title: 'Start the Analysis',
        content: 'Once you have your charts ready, click this button to let our AI work its magic.',
        position: 'top',
    },
    {
        targetId: 'tour-step-4',
        title: 'Review Your History',
        content: 'Your past analyses are saved here. Click any item to view the detailed results again.',
        position: 'left',
    },
    {
        targetId: 'tour-step-5',
        title: 'Manage Your Account',
        content: 'Access your profile, account settings, and sign out from here.',
        position: 'left',
    },
];

const TOUR_STORAGE_KEY = 'great-trades-ai-tour-completed';

export const Tour: React.FC = () => {
    const [stepIndex, setStepIndex] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });

    useEffect(() => {
        const tourCompleted = localStorage.getItem(TOUR_STORAGE_KEY);
        if (!tourCompleted) {
             // Delay starting the tour slightly to ensure the main UI is rendered
            const timer = setTimeout(() => setIsActive(true), 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const currentStep = TOUR_STEPS[stepIndex];
    const isModalStep = !currentStep.targetId;

    useEffect(() => {
        if (!isActive || isModalStep) return;

        const handleResize = () => {
            const step = TOUR_STEPS[stepIndex];
            if (!step.targetId) return;
            const targetElement = document.getElementById(step.targetId);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                setPosition({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
            }
        };
        
        // Use a short timeout to ensure the element is painted before we get its rect
        const timer = setTimeout(handleResize, 100);
        window.addEventListener('resize', handleResize);
        
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', handleResize)
        };
    }, [stepIndex, isActive, isModalStep]);

    const completeTour = () => {
        setIsActive(false);
        localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    };

    const nextStep = () => {
        if (stepIndex < TOUR_STEPS.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            completeTour();
        }
    };
    
    const prevStep = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        }
    };

    if (!isActive) return null;

    const tooltipStyle: React.CSSProperties = {};
    const arrowStyle: React.CSSProperties = {};

    if (isModalStep) {
        tooltipStyle.top = '50%';
        tooltipStyle.left = '50%';
        tooltipStyle.transform = 'translate(-50%, -50%)';
    } else {
        switch (currentStep.position) {
            case 'bottom':
                tooltipStyle.top = `${position.top + position.height + 15}px`;
                tooltipStyle.left = `${position.left + position.width / 2}px`;
                tooltipStyle.transform = 'translateX(-50%)';
                arrowStyle.bottom = '100%';
                arrowStyle.left = '50%';
                arrowStyle.transform = 'translateX(-50%)';
                arrowStyle.borderBottom = '8px solid var(--bg-color-alt)';
                arrowStyle.borderLeft = '8px solid transparent';
                arrowStyle.borderRight = '8px solid transparent';
                break;
            case 'top':
                tooltipStyle.top = `${position.top - 15}px`;
                tooltipStyle.left = `${position.left + position.width / 2}px`;
                tooltipStyle.transform = 'translate(-50%, -100%)';
                arrowStyle.top = '100%';
                arrowStyle.left = '50%';
                arrowStyle.transform = 'translateX(-50%)';
                arrowStyle.borderTop = '8px solid var(--bg-color-alt)';
                arrowStyle.borderLeft = '8px solid transparent';
                arrowStyle.borderRight = '8px solid transparent';
                break;
            case 'left':
                tooltipStyle.top = `${position.top + position.height / 2}px`;
                tooltipStyle.left = `${position.left - 15}px`;
                tooltipStyle.transform = 'translate(-100%, -50%)';
                arrowStyle.top = '50%';
                arrowStyle.left = '100%';
                arrowStyle.transform = 'translateY(-50%)';
                arrowStyle.borderLeft = '8px solid var(--bg-color-alt)';
                arrowStyle.borderTop = '8px solid transparent';
                arrowStyle.borderBottom = '8px solid transparent';
                break;
        }
    }


    return (
        <>
            <div className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm animate-fade-in-up" style={{animationDuration: '0.3s'}} onClick={completeTour}></div>
            {!isModalStep && (
                <div
                    className="fixed border-2 border-emerald-500 rounded-lg shadow-2xl transition-all duration-300 z-[51] pointer-events-none"
                    style={{ ...position, boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' }}
                ></div>
            )}
            <div
                className="fixed z-[51] bg-bg-color-alt p-4 rounded-lg shadow-lg w-72 animate-fade-in-up"
                style={{...tooltipStyle, animationDuration: '0.3s'}}
                onClick={e => e.stopPropagation()}
            >
                {!isModalStep && <div className="absolute" style={arrowStyle}></div>}
                <h3 className="font-bold text-lg text-emerald-400 mb-2">{currentStep.title}</h3>
                <p className="text-sm text-text-primary mb-4">{currentStep.content}</p>
                <div className="flex justify-between items-center">
                    <button onClick={completeTour} className="text-sm text-text-secondary hover:text-text-primary">Skip</button>
                    <div className="flex items-center gap-2">
                         {stepIndex > 0 && <button onClick={prevStep} className="px-3 py-1 text-sm rounded-md bg-slate-700 hover:bg-slate-600 text-white">Back</button>}
                        <button onClick={nextStep} className="px-4 py-1 text-sm font-semibold rounded-md bg-emerald-600 hover:bg-emerald-500 text-white">
                            {stepIndex === TOUR_STEPS.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};