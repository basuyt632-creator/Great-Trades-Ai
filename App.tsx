import React, { useState, useCallback, useEffect } from 'react';
import type { AnalysisResult, HistoryItem } from './types';
import { analyzeChartImage } from './services/geminiService';
import { Header } from './components/Header';
import { Loader } from './components/Loader';
import { AnalysisResultDisplay } from './components/AnalysisResult';
import { ImageUploader } from './components/ImageUploader';
import { HistoryPanel } from './components/HistoryPanel';
import { onAuthChange, type User } from './services/firebaseService';
import { Login } from './components/Login';
import { SettingsPage } from './components/SettingsPage';
import { Toast } from './components/Toast';
import { Tour } from './components/Tour';
import { useSettings } from './contexts/SettingsContext';
import { hexToHsl } from './utils/colorUtils';
import { ErrorIcon } from './components/icons/ErrorIcon';

interface SelectedFile {
    file: File;
    url: string;
}

interface ToastMessage {
    id: number;
    message: string;
    type: 'success' | 'error';
}

const createImageThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIMENSION = 100;
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Could not get canvas context'));
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.onerror = reject;
            if (e.target?.result) {
                img.src = e.target.result as string;
            } else {
                reject(new Error("FileReader did not produce a result."));
            }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};


const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [analyzedImageUrl, setAnalyzedImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);
    
    const { settings, isSettingsLoaded, tourKey } = useSettings();

    useEffect(() => {
        const { h, s, l } = hexToHsl(settings.accentColor);
        document.documentElement.style.setProperty('--accent-h', `${h}`);
        document.documentElement.style.setProperty('--accent-s', `${s}%`);
        document.documentElement.style.setProperty('--accent-l', `${l}%`);
    }, [settings.accentColor]);

    const addToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        const id = Date.now();
        setToasts(prevToasts => [...prevToasts, { id, message, type }]);
        setTimeout(() => {
            setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
        }, 5000);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthChange(currentUser => {
            setUser(currentUser);
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getHistoryKey = useCallback(() => {
        if (!user) return null;
        return `tradeHistory_${user.uid}`;
    }, [user]);

    useEffect(() => {
        const historyKey = getHistoryKey();
        if (historyKey && settings.historyTrackingEnabled) {
            try {
                const savedHistory = localStorage.getItem(historyKey);
                if (savedHistory) {
                    setHistory(JSON.parse(savedHistory));
                } else {
                    setHistory([]);
                }
            } catch (err) {
                console.error("Failed to load history from localStorage", err);
                setHistory([]);
            }
        } else {
            setHistory([]);
            if (historyKey) {
                localStorage.removeItem(historyKey);
            }
        }
    }, [user, getHistoryKey, settings.historyTrackingEnabled]);

    const updateAndSaveHistory = (newHistory: HistoryItem[]) => {
        setHistory(newHistory);
        const historyKey = getHistoryKey();
        if(historyKey && settings.historyTrackingEnabled) {
            localStorage.setItem(historyKey, JSON.stringify(newHistory));
        }
    }

    const handleFilesSelect = useCallback((files: FileList) => {
        selectedFiles.forEach(f => URL.revokeObjectURL(f.url));
        const newFiles = Array.from(files).map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));
        setSelectedFiles(newFiles);
        setAnalysisResult(null);
        setError(null);
    }, [selectedFiles]);
    
    const handlePastedFile = useCallback((file: File) => {
        const newFiles = [{ file, url: URL.createObjectURL(file) }];
        setSelectedFiles(prevFiles => {
            prevFiles.forEach(f => URL.revokeObjectURL(f.url));
            return newFiles;
        });
        setAnalysisResult(null);
        setError(null);
    }, []);

    const handleRemoveImage = useCallback((indexToRemove: number) => {
        const fileToRemove = selectedFiles[indexToRemove];
        if (fileToRemove) {
            URL.revokeObjectURL(fileToRemove.url);
        }
        setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove));
    }, [selectedFiles]);

    const handleClearAllImages = useCallback(() => {
        selectedFiles.forEach(f => URL.revokeObjectURL(f.url));
        setSelectedFiles([]);
    }, [selectedFiles]);

    useEffect(() => {
        const handlePaste = (event: ClipboardEvent) => {
            const items = event.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        handlePastedFile(file);
                        break;
                    }
                }
            }
        };

        window.addEventListener('paste', handlePaste);
        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [handlePastedFile]);

    const handleAnalyze = useCallback(async () => {
        if (selectedFiles.length === 0) {
            setError("Please select one or more images first.");
            return;
        }

        setIsLoading(true);
        setAnalysisResult(null);
        setAnalyzedImageUrl(null);
        setError(null);

        const analysisPromises = selectedFiles.map(async (selectedFile) => {
            const result = await analyzeChartImage(selectedFile.file, settings);
            const thumbnail = await createImageThumbnail(selectedFile.file);
            return {
                id: Date.now() + Math.random(),
                timestamp: new Date().toISOString(),
                thumbnailDataUrl: thumbnail,
                result: result,
            };
        });

        const results = await Promise.allSettled(analysisPromises);
        
        const newHistoryItems: HistoryItem[] = [];
        const failedAnalyses: { reason: any }[] = [];

        results.forEach(res => {
            if (res.status === 'fulfilled') {
                newHistoryItems.push(res.value);
            } else {
                failedAnalyses.push(res);
            }
        });

        const failedCount = failedAnalyses.length;

        if (newHistoryItems.length > 0) {
            if (settings.historyTrackingEnabled) {
                updateAndSaveHistory([...newHistoryItems, ...history]);
            }
            setAnalysisResult(newHistoryItems[0].result);
             try {
                const imageUrl = await fileToDataUrl(selectedFiles[0].file);
                setAnalyzedImageUrl(imageUrl);
            } catch (e) {
                console.error("Could not create image data URL for display", e);
            }
        }

        if (failedCount > 0) {
             if (selectedFiles.length === 1 && failedCount === 1 && failedAnalyses[0].reason instanceof Error) {
                const specificError = failedAnalyses[0].reason.message;
                setError(specificError);
                addToast(specificError, 'error');
            } else {
                const errorMessage = `Analyzed ${newHistoryItems.length} charts successfully. ${failedCount} analyses failed.`;
                setError(errorMessage);
                addToast(errorMessage, 'error');
            }
        } else {
             setError(null);
             if (newHistoryItems.length > 0) {
                addToast(`Successfully analyzed ${newHistoryItems.length} chart(s)!`, 'success');
             }
        }

        handleClearAllImages();
        setIsLoading(false);

    }, [selectedFiles, history, handleClearAllImages, addToast, settings]);

    const handleSelectHistory = useCallback((id: number) => {
        const selectedItem = history.find(item => item.id === id);
        if (selectedItem) {
            setAnalysisResult(selectedItem.result);
            setAnalyzedImageUrl(null);
            handleClearAllImages();
            setError(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [history, handleClearAllImages]);

    const handleClearHistory = useCallback(() => {
        if (window.confirm("Are you sure you want to clear all analysis history? This action cannot be undone.")) {
            updateAndSaveHistory([]);
            const historyKey = getHistoryKey();
            if(historyKey) localStorage.removeItem(historyKey);
            addToast('History cleared successfully', 'success');
        }
    }, [updateAndSaveHistory, addToast, getHistoryKey]);

    const WelcomeMessage = () => (
        <div className="text-center p-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold mb-2 text-text-primary">Welcome to Great Trades AI</h2>
            <p className="text-text-secondary max-w-xl mx-auto">
                Upload one or more trading charts to get instant, AI-powered analysis. You can also paste an image from your clipboard.
            </p>
        </div>
    );

    const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => {
        const isChartNotFoundError = message.toLowerCase().includes('no chart found');
        const isApiError = message.toLowerCase().includes('api key') || message.toLowerCase().includes('billing');
        
        let title = 'Analysis Error';
        if (isChartNotFoundError) title = 'Image Not Recognized';
        else if (isApiError) title = 'Configuration Error';
        
        return (
            <div className="w-full max-w-2xl mx-auto mt-8 bg-red-900/50 border border-red-700 rounded-xl p-6 text-center animate-fade-in-up flex flex-col items-center gap-4">
                <ErrorIcon />
                <p className="font-bold text-red-300 text-lg">{title}</p>
                <p className="text-red-400">{message}</p>
            </div>
        );
    };
    
    if (authLoading || !isSettingsLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-bg-color">
                <Loader message="Initializing secure session..." />
            </div>
        )
    }
    
    if (!user) {
        return <Login />;
    }

    return (
        <div className={`min-h-screen flex flex-col bg-bg-color text-text-primary ${settings.uiDensity === 'Compact' ? 'text-sm' : ''}`}>
            <Tour key={tourKey} />
            <div className="animate-slide-in-down relative z-30">
                <Header user={user} onSettingsClick={() => setIsSettingsOpen(true)} />
            </div>
            <main className="flex-grow container mx-auto p-4 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 flex flex-col items-center gap-8 animate-fade-in-up" style={{animationDelay: '200ms'}}>
                        <ImageUploader 
                            onFilesSelect={handleFilesSelect}
                            onRemoveImage={handleRemoveImage}
                            onClearAll={handleClearAllImages}
                            images={selectedFiles}
                            onAnalyze={handleAnalyze}
                            isLoading={isLoading}
                        />
                        
                        <div className="w-full">
                            {isLoading && <Loader message={`Our AI is examining patterns, indicators, and market sentiment across ${selectedFiles.length} chart(s). This might take a moment.`} />}
                            {error && !isLoading && <ErrorDisplay message={error} />}
                            {analysisResult && !isLoading && <AnalysisResultDisplay result={analysisResult} imageUrl={analyzedImageUrl} />}
                            {!isLoading && !error && !analysisResult && <WelcomeMessage />}
                        </div>
                    </div>
                    <div className="lg:col-span-1 animate-slide-in-right" style={{animationDelay: '300ms'}}>
                        <HistoryPanel 
                            history={history}
                            onSelect={handleSelectHistory}
                        />
                    </div>
                </div>
            </main>
            <footer className="text-center p-4 text-text-secondary text-sm border-t border-border-color mt-auto">
                <p>Disclaimer: This is an AI-generated analysis and not financial advice. Always do your own research.</p>
                <p className="mt-2">The Website Created By Sujan Basu</p>
            </footer>
            {isSettingsOpen && user && (
                <SettingsPage 
                    user={user} 
                    history={history}
                    onClearHistory={handleClearHistory}
                    onClose={() => setIsSettingsOpen(false)} 
                    addToast={addToast}
                />
            )}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast 
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onDismiss={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                    />
                ))}
            </div>
        </div>
    );
};

export default App;