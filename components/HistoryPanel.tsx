import React from 'react';
import type { HistoryItem } from '../types';
import { TradeTrend } from '../types';
import { LogoIcon } from './icons/LogoIcon';

interface HistoryPanelProps {
    history: HistoryItem[];
    onSelect: (id: number) => void;
}

const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    if (seconds < 5) return "just now";
    return Math.floor(seconds) + " seconds ago";
};

const HistoryItemCard: React.FC<{ item: HistoryItem, onSelect: (id: number) => void, isNew: boolean }> = ({ item, onSelect, isNew }) => {
    const isBullish = item.result.trend === TradeTrend.BULLISH;
    const isBearish = item.result.trend === TradeTrend.BEARISH;
    const trendColor = isBullish ? 'border-l-green-500' : isBearish ? 'border-l-red-500' : 'border-l-yellow-500';
    const animationClass = isNew ? 'animate-fade-in-up' : '';

    return (
        <button 
            onClick={() => onSelect(item.id)}
            className={`w-full text-left p-3 bg-bg-color-alt/60 hover:bg-bg-color-alt rounded-lg transition-all duration-200 flex items-center gap-4 border-l-4 ${trendColor} transform hover:scale-105 ${animationClass}`}
        >
            <img src={item.thumbnailDataUrl} alt="Chart thumbnail" className="w-12 h-12 rounded-md object-cover flex-shrink-0 bg-bg-color" />
            <div className="flex-grow overflow-hidden">
                <p className="font-semibold truncate text-text-primary">{item.result.action}: {item.result.trend}</p>
                <p className="text-xs text-text-secondary">{formatTimeAgo(item.timestamp)}</p>
            </div>
            <div className="text-right flex-shrink-0">
                <p className="font-bold text-lg text-text-primary">{Math.round(item.result.confidence)}%</p>
                <p className="text-xs text-text-secondary">Conf.</p>
            </div>
        </button>
    );
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect }) => {
    return (
        <aside id="tour-step-4" className="bg-panel-color backdrop-blur-sm border border-border-color rounded-xl p-4 sticky top-24">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text-primary">Analysis History</h2>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {history.length === 0 ? (
                    <div className="text-center text-text-secondary py-8 flex flex-col items-center">
                        <LogoIcon className="w-16 h-16 text-[var(--accent-color)]/30 mb-4" />
                        <p className="font-semibold text-text-primary">No History Yet</p>
                        <p className="text-sm max-w-xs">Your analyzed charts will appear here for you to review later.</p>
                    </div>
                ) : (
                    history.map((item, index) => <HistoryItemCard key={item.id} item={item} onSelect={onSelect} isNew={index === 0} />)
                )}
            </div>
        </aside>
    );
};