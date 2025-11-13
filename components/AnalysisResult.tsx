import React from 'react';
import type { AnalysisResult } from '../types';
import { TradeTrend, TradeAction } from '../types';
import { ConfidenceGauge } from './ConfidenceGauge';
import { PatternIcon } from './icons/PatternIcon';
import { SupportIcon } from './icons/SupportIcon';
import { ResistanceIcon } from './icons/ResistanceIcon';
import { SwingPointIcon } from './icons/SwingPointIcon';
import { CandlestickIcon } from './icons/CandlestickIcon';

interface AnalysisResultProps {
    data: AnalysisResult;
}

const TrendIndicator: React.FC<{ trend: TradeTrend }> = ({ trend }) => {
    const isBullish = trend === TradeTrend.BULLISH;
    const isBearish = trend === TradeTrend.BEARISH;

    const trendColor = isBullish ? 'text-green-500' : isBearish ? 'text-red-500' : 'text-yellow-500';
    const bgColor = isBullish ? 'bg-green-500/10' : isBearish ? 'bg-red-500/10' : 'bg-yellow-500/10';
    const icon = isBullish ? '▲' : isBearish ? '▼' : '▬';

    return (
        <div className={`flex items-center gap-4 p-4 rounded-lg ${bgColor}`}>
            <span className={`text-5xl font-black ${trendColor}`}>{icon}</span>
            <div>
                <p className="text-sm text-text-secondary">Market Trend</p>
                <p className={`text-3xl font-bold ${trendColor}`}>{trend}</p>
            </div>
        </div>
    );
};

const ActionIndicator: React.FC<{ action: TradeAction }> = ({ action }) => {
    const isBuy = action === TradeAction.BUY;
    const isSell = action === TradeAction.SELL;
    
    const actionColor = isBuy ? 'text-green-500' : isSell ? 'text-red-500' : 'text-yellow-500';
    const bgColor = isBuy ? 'bg-green-500/10' : isSell ? 'bg-red-500/10' : 'bg-yellow-500/10';

    return (
        <div className={`p-4 rounded-lg text-center ${bgColor}`}>
             <p className="text-sm text-text-secondary">Recommended Action</p>
             <p className={`text-3xl font-bold ${actionColor}`}>{action}</p>
        </div>
    );
};

const KeyObservationItem: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-emerald-400 pt-1">{icon}</div>
        <div>
            <p className="font-semibold text-text-primary">{label}</p>
            <p className="text-text-secondary">{value}</p>
        </div>
    </div>
);

export const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({ data }) => {
    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div style={{ animationDelay: '100ms' }} className="animate-fade-in-up bg-panel-color backdrop-blur-sm p-6 rounded-xl border border-border-color flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Trade Confidence</h3>
                    <p className="text-sm text-text-secondary mb-4">संभावित सटीकता (Chance of being correct)</p>
                    <ConfidenceGauge confidence={data.confidence} />
                </div>
                
                <div style={{ animationDelay: '200ms' }} className="animate-fade-in-up space-y-4 flex flex-col justify-center">
                     <TrendIndicator trend={data.trend} />
                     <ActionIndicator action={data.action} />
                </div>
            </div>

            <div style={{ animationDelay: '300ms' }} className="animate-fade-in-up bg-panel-color backdrop-blur-sm p-6 rounded-xl border border-border-color">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Analysis Summary</h3>
                <p className="text-text-primary">{data.summary}</p>
            </div>
            
            <div style={{ animationDelay: '400ms' }} className="animate-fade-in-up bg-panel-color backdrop-blur-sm p-6 rounded-xl border border-border-color">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Key Observations</h3>
                <div className="space-y-4 mt-4">
                    <KeyObservationItem icon={<PatternIcon />} label="Key Patterns" value={data.keyPatterns} />
                    <KeyObservationItem icon={<CandlestickIcon />} label="Candlestick Analysis" value={data.candlestickAnalysis} />
                    <KeyObservationItem icon={<SupportIcon />} label="Support Level" value={data.supportLevel} />
                    <KeyObservationItem icon={<ResistanceIcon />} label="Resistance Level" value={data.resistanceLevel} />
                    <KeyObservationItem icon={<SwingPointIcon />} label="Swing Points" value={data.swingPoints} />
                </div>
            </div>

            <div style={{ animationDelay: '500ms' }} className="animate-fade-in-up bg-panel-color backdrop-blur-sm p-6 rounded-xl border border-border-color">
                <h3 className="text-xl font-bold text-emerald-400 mb-2">Detailed Analysis</h3>
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">{data.detailedAnalysis}</p>
            </div>
        </div>
    );
};