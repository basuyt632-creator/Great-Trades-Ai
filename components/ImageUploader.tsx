import React, { useState } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface ImageUploaderProps {
    onFilesSelect: (files: FileList) => void;
    images: { url: string; file: File }[];
    onRemoveImage: (index: number) => void;
    onClearAll: () => void;
    onAnalyze: () => void;
    isLoading: boolean;
    timeFrame: string;
    setTimeFrame: (value: string) => void;
    userPreferences: Record<string, string>;
    setUserPreferences: (prefs: Record<string, string>) => void;
}

const timeFrames = ['Not Specified', '1m', '5m', '15m', '1H', '4H', '1D', '1W'];
const questions = [
    {
        key: 'tradingStyle',
        question: 'What is your trading style?',
        options: ['Day Trader', 'Swing Trader', 'Position Trader', 'Scalper', 'Not Specified'],
    },
    {
        key: 'primaryGoal',
        question: 'What is your primary goal?',
        options: ['Entry/Exit', 'Understand Trend', 'Find Patterns', 'Risk Assessment', 'Not Specified'],
    },
    {
        key: 'riskTolerance',
        question: 'What\'s your risk tolerance?',
        options: ['Low', 'Medium', 'High', 'Not Specified'],
    },
    {
        key: 'investmentHorizon',
        question: 'What is your investment horizon?',
        options: ['Short-term', 'Long-term', 'Not Specified'],
    }
];

const PreferenceQuestion: React.FC<{ question: string, options: string[], selected: string, onSelect: (value: string) => void }> = ({ question, options, selected, onSelect }) => (
    <div className="text-left">
        <p className="font-medium text-text-primary mb-2">{question}</p>
        <div className="flex flex-wrap gap-2">
            {options.map(opt => (
                <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                        selected === opt
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-bg-color-alt text-text-secondary hover:bg-slate-700 hover:text-text-primary'
                    }`}
                >
                    {opt}
                </button>
            ))}
        </div>
    </div>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ 
    onFilesSelect, 
    images,
    onRemoveImage,
    onClearAll,
    onAnalyze,
    isLoading,
    timeFrame,
    setTimeFrame,
    userPreferences,
    setUserPreferences,
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
    const imageCount = images.length;
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            onFilesSelect(e.target.files);
            e.target.value = '';
        }
    };

    const handleDragEvents = (e: React.DragEvent<HTMLLabelElement>, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files) {
            onFilesSelect(e.dataTransfer.files);
        }
    };
    
    const handlePreferenceChange = (key: string, value: string) => {
        setUserPreferences({ ...userPreferences, [key]: value });
    };

    const dragDropClasses = isDragging 
        ? 'border-emerald-500 bg-bg-color-alt animate-pulse-glow' 
        : 'border-border-color hover:border-emerald-500 hover:bg-bg-color-alt';

    return (
        <div className="w-full max-w-2xl mx-auto bg-panel-color backdrop-blur-sm border border-border-color rounded-xl p-8 text-center flex flex-col items-center space-y-6">
            
            {imageCount > 0 && (
                <div className="w-full">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-48 overflow-y-auto pr-2">
                        {images.map((img, index) => (
                            <div key={index} className="relative group aspect-square animate-fade-in-up" style={{animationDelay: `${index * 50}ms`}}>
                                <img src={img.url} alt={`Chart preview ${index + 1}`} className="w-full h-full rounded-md object-cover bg-slate-700" />
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onRemoveImage(index);
                                    }}
                                    className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full p-1.5 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-white opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                                    aria-label={`Remove image ${index + 1}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                    <hr className="border-t border-border-color my-4" />
                </div>
            )}
            
            <label 
                id="tour-step-2"
                htmlFor="chart-upload" 
                className={`w-full cursor-pointer p-10 border-2 border-dashed rounded-lg transition-all duration-300 flex flex-col items-center justify-center ${dragDropClasses}`}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDrop={handleDrop}
             >
                <div className="flex flex-col items-center text-text-secondary">
                    <UploadIcon className="w-12 h-12 mb-4" />
                    <span className="font-semibold">Click to upload or drag & drop</span>
                    <span className="text-sm">You can select multiple files. Paste from clipboard also works.</span>
                </div>
                <input id="chart-upload" type="file" multiple className="hidden" accept="image/png, image/jpeg, image/webp" onChange={handleFileChange} />
            </label>

            <div className="w-full space-y-4 text-left">
                <div>
                    <h3 className="text-lg font-semibold text-text-primary mb-3">Chart Time Frame</h3>
                    <div className="flex flex-wrap gap-2">
                        {timeFrames.map(t => (
                            <button
                                key={t}
                                onClick={() => setTimeFrame(t)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                                    timeFrame === t 
                                    ? 'bg-emerald-600 text-white shadow-md' 
                                    : 'bg-bg-color-alt text-text-secondary hover:bg-slate-700 hover:text-text-primary'
                                }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-border-color pt-4">
                     <button onClick={() => setIsCustomizerOpen(!isCustomizerOpen)} className="w-full flex justify-between items-center text-lg font-semibold text-text-primary">
                        <span>Tailor Your Analysis</span>
                         <svg className={`w-5 h-5 transition-transform duration-300 ${isCustomizerOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                    {isCustomizerOpen && (
                        <div className="mt-3 space-y-4 animate-fade-in-up" style={{animationDuration: '0.4s'}}>
                            {questions.map(q => (
                                <PreferenceQuestion 
                                    key={q.key}
                                    question={q.question}
                                    options={q.options}
                                    selected={userPreferences[q.key]}
                                    onSelect={(value) => handlePreferenceChange(q.key, value)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <button
                    onClick={onClearAll}
                    disabled={imageCount === 0 || isLoading}
                    className="w-full py-3 px-6 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    Clear All
                </button>
                <button
                    id="tour-step-3"
                    onClick={onAnalyze}
                    disabled={imageCount === 0 || isLoading}
                    className="relative w-full py-3 px-6 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-500 transition-all duration-200 ease-in-out disabled:bg-slate-600 disabled:cursor-not-allowed disabled:transform-none transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
                >
                    <span className={isLoading ? 'opacity-0' : 'opacity-100'}>
                        {`Analyze ${imageCount} Chart(s)`}
                    </span>
                    {isLoading && (
                         <div className="absolute inset-0 flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        </div>
                    )}
                </button>
            </div>
        </div>
    );
};