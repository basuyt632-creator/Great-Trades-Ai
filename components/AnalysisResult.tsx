import React, { useState } from 'react';
import type { AnalysisResult } from '../types';
import { TradeTrend, TradeAction, IndicatorSignal } from '../types';
import { ConfidenceGauge } from './ConfidenceGauge';
import { PatternIcon } from './icons/PatternIcon';
import { SupportIcon } from './icons/SupportIcon';
import { ResistanceIcon } from './icons/ResistanceIcon';
import { SwingPointIcon } from './icons/SwingPointIcon';
import { CandlestickIcon } from './icons/CandlestickIcon';
import { PriceTargetIcon } from './icons/PriceTargetIcon';
import { StopLossIcon } from './icons/StopLossIcon';
import { VolatilityIcon } from './icons/VolatilityIcon';
import { RsiIcon } from './icons/RsiIcon';
import { MacdIcon } from './icons/MacdIcon';
import { MovingAverageIcon } from './icons/MovingAverageIcon';
import { BollingerBandsIcon } from './icons/BollingerBandsIcon';
import { VolumeIcon } from './icons/VolumeIcon';
import { RiskRewardIcon } from './icons/RiskRewardIcon';
import { SentimentIcon } from './icons/SentimentIcon';
import { ScenarioIcon } from './icons/ScenarioIcon';
import { EducationIcon } from './icons/EducationIcon';
import { InfoIcon } from './icons/InfoIcon';
import { ElliottWaveIcon } from './icons/ElliottWaveIcon';
import { FibonacciIcon } from './icons/FibonacciIcon';
import { IchimokuIcon } from './icons/IchimokuIcon';
import { TradeSetupIcon } from './icons/TradeSetupIcon';
import { ConfluenceIcon } from './icons/ConfluenceIcon';

interface AnalysisResultProps {
    result: AnalysisResult;
    imageUrl: string | null;
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

const KeyObservationItem: React.FC<{ icon: React.ReactNode; label: string; value: React.ReactNode }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 text-[var(--accent-color)] pt-1">{icon}</div>
        <div>
            <p className="font-semibold text-text-primary">{label}</p>
            <p className="text-text-secondary whitespace-pre-wrap">{value}</p>
        </div>
    </div>
);

const getIndicatorSignalColor = (signal: IndicatorSignal | string) => {
    switch (signal) {
        case IndicatorSignal.STRONG_BUY:
        case IndicatorSignal.BUY:
        case IndicatorSignal.BULLISH_CROSSOVER:
        case IndicatorSignal.OVERSOLD: // Oversold is a bullish signal
            return 'bg-green-500/20 text-green-400';
        case IndicatorSignal.STRONG_SELL:
        case IndicatorSignal.SELL:
        case IndicatorSignal.BEARISH_CROSSOVER:
        case IndicatorSignal.OVERBOUGHT: // Overbought is a bearish signal
            return 'bg-red-500/20 text-red-400';
        default:
            return 'bg-slate-600/50 text-slate-300';
    }
}

const IndicatorCard: React.FC<{ icon: React.ReactNode, name: string, signal: IndicatorSignal | string, children: React.ReactNode }> = ({ icon, name, signal, children }) => {
    const signalColor = getIndicatorSignalColor(signal);

    return (
        <div className="bg-bg-color-alt p-4 rounded-lg border border-border-color flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-text-secondary">{icon}</span>
                    <h4 className="font-semibold text-text-primary">{name}</h4>
                </div>
                <span className={`px-2 py-1 text-xs font-bold rounded-full ${signalColor} whitespace-nowrap`}>{signal}</span>
            </div>
            <div className="text-sm text-text-secondary space-y-2 mt-2 flex-grow">{children}</div>
        </div>
    );
};

export const AnalysisResultDisplay: React.FC<AnalysisResultProps> = ({ result, imageUrl }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const TabButton = ({ id, label }: { id: string; label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`px-4 py-2 font-semibold rounded-t-lg transition-colors border-b-2 text-sm sm:text-base ${
                activeTab === id
                    ? 'text-[var(--accent-color)] border-[var(--accent-color)]'
                    : 'text-text-secondary border-transparent hover:text-text-primary'
            }`}
        >
            {label}
        </button>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview': return (
                <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--accent-color)] mb-2">Detailed Analysis</h3>
                        <p className="text-text-primary whitespace-pre-wrap leading-relaxed">{result.detailedAnalysis}</p>
                    </div>
                     <KeyObservationItem icon={<ConfluenceIcon />} label="Confluence Factors" value={result.confluenceFactors} />
                    <div>
                        <h3 className="text-xl font-bold text-[var(--accent-color)] mb-4">Key Observations</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                            <KeyObservationItem icon={<PatternIcon />} label="Key Patterns" value={result.keyPatterns} />
                            <KeyObservationItem icon={<CandlestickIcon />} label="Candlestick Analysis" value={result.candlestickAnalysis} />
                            <KeyObservationItem icon={<SupportIcon />} label="Support Level" value={result.supportLevel} />
                            <KeyObservationItem icon={<ResistanceIcon />} label="Resistance Level" value={result.resistanceLevel} />
                            <KeyObservationItem icon={<SwingPointIcon />} label="Swing Points" value={result.swingPoints} />
                            <KeyObservationItem icon={<VolatilityIcon />} label="Volatility" value={result.volatility} />
                        </div>
                    </div>
                </div>
            );
            case 'indicators': return (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                    <IndicatorCard icon={<RsiIcon />} name="RSI" signal={result.rsi.signal}>
                        <p><strong>Value:</strong> {result.rsi.value.toFixed(2)}</p>
                        <p>{result.rsi.interpretation}</p>
                    </IndicatorCard>
                     <IndicatorCard icon={<MacdIcon />} name="MACD" signal={result.macd.signal}>
                        <p><strong>MACD Line:</strong> {result.macd.macdLine.toFixed(4)}</p>
                        <p><strong>Signal Line:</strong> {result.macd.signalLine.toFixed(4)}</p>
                        <p><strong>Histogram:</strong> {result.macd.histogram.toFixed(4)}</p>
                        <p>{result.macd.interpretation}</p>
                    </IndicatorCard>
                    <IndicatorCard icon={<MovingAverageIcon />} name="Moving Averages" signal={result.movingAverages.signal}>
                         <p><strong>Short-term ({result.movingAverages.shortTerm.period}-period):</strong> {result.movingAverages.shortTerm.value.toFixed(2)}</p>
                         <p><strong>Long-term ({result.movingAverages.longTerm.period}-period):</strong> {result.movingAverages.longTerm.value.toFixed(2)}</p>
                         <p>{result.movingAverages.interpretation}</p>
                    </IndicatorCard>
                    <IndicatorCard icon={<BollingerBandsIcon />} name="Bollinger Bands" signal={result.bollingerBands.signal}>
                        <p><strong>Upper Band:</strong> {result.bollingerBands.upperBand.toFixed(2)}</p>
                        <p><strong>Middle Band:</strong> {result.bollingerBands.middleBand.toFixed(2)}</p>
                        <p><strong>Lower Band:</strong> {result.bollingerBands.lowerBand.toFixed(2)}</p>
                        <p>{result.bollingerBands.interpretation}</p>
                    </IndicatorCard>
                </div>
            );
             case 'advanced': return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                    <IndicatorCard icon={<ElliottWaveIcon />} name="Elliott Wave" signal={result.elliottWave.currentWave}>
                        <p>{result.elliottWave.interpretation}</p>
                    </IndicatorCard>
                    <IndicatorCard icon={<FibonacciIcon />} name="Fibonacci Analysis" signal="Levels">
                        <p><strong>Retracement:</strong> {result.fibonacciAnalysis.keyRetracementLevels}</p>
                        <p><strong>Extension:</strong> {result.fibonacciAnalysis.keyExtensionLevels}</p>
                        <p>{result.fibonacciAnalysis.interpretation}</p>
                    </IndicatorCard>
                    <IndicatorCard icon={<IchimokuIcon />} name="Ichimoku Cloud" signal={result.ichimokuCloud.signal}>
                        <p>{result.ichimokuCloud.interpretation}</p>
                    </IndicatorCard>
                </div>
            );
            case 'risk': return (
                <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                     <div>
                        <h3 className="text-xl font-bold text-[var(--accent-color)] mb-4">Actionable Trade Setup</h3>
                        <div className="space-y-4 bg-bg-color-alt p-4 rounded-lg border border-border-color">
                            <KeyObservationItem icon={<TradeSetupIcon />} label="Entry Strategy" value={result.tradeSetup.entryStrategy} />
                            <KeyObservationItem icon={<PriceTargetIcon />} label="Profit Targets" value={result.tradeSetup.profitTargets} />
                            <KeyObservationItem icon={<StopLossIcon />} label="Stop-Loss Strategy" value={result.tradeSetup.stopLossStrategy} />
                            <KeyObservationItem icon={<InfoIcon />} label="Rationale" value={result.tradeSetup.rationale} />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-xl font-bold text-[var(--accent-color)]">Risk & Reward Assessment</h3>
                            <div className="group relative">
                                <InfoIcon className="text-text-secondary cursor-pointer"/>
                                <div className="absolute bottom-full mb-2 w-64 bg-bg-color-alt text-text-primary text-sm rounded-lg p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-border-color z-10">
                                    Analysis tailored based on your financial context settings (budget, risk exposure).
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <KeyObservationItem icon={<PriceTargetIcon />} label="Price Targets (Summary)" value={result.priceTarget} />
                            <KeyObservationItem icon={<StopLossIcon />} label="Suggested Stop-Loss (Summary)" value={result.stopLoss} />
                            <KeyObservationItem icon={<RiskRewardIcon />} label="Risk/Reward Ratio" value={result.riskRewardRatio} />
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--accent-color)] mb-4">Alternative Scenarios</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <KeyObservationItem icon={<ScenarioIcon />} label="Bullish Case" value={result.alternativeScenario.bullish} />
                           <KeyObservationItem icon={<ScenarioIcon />} label="Bearish Case" value={result.alternativeScenario.bearish} />
                        </div>
                    </div>
                </div>
            );
            case 'context': return (
                 <div className="space-y-6 animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
                    <KeyObservationItem icon={<VolumeIcon />} label="Volume Analysis" value={result.volumeAnalysis} />
                    <KeyObservationItem icon={<SentimentIcon />} label="Market Sentiment" value={result.marketSentiment} />
                    <KeyObservationItem icon={<EducationIcon />} label="Educational Insight" value={result.educationalInsight} />
                 </div>
            );
            default: return null;
        }
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-0 sm:p-4 space-y-6">
            {imageUrl && (
                <div style={{ animationDelay: '50ms' }} className="animate-fade-in-up">
                    <h3 className="text-xl font-bold text-[var(--accent-color)] mb-2">Analyzed Chart</h3>
                    <img src={imageUrl} alt="Analyzed chart" className="w-full h-auto block border border-border-color rounded-lg bg-bg-color-alt" />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div style={{ animationDelay: '100ms' }} className="animate-fade-in-up bg-panel-color backdrop-blur-sm p-6 rounded-xl border border-border-color flex flex-col items-center justify-center text-center">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">Trade Confidence</h3>
                    <p className="text-sm text-text-secondary mb-4">Chance of being correct</p>
                    <ConfidenceGauge confidence={result.confidence} />
                </div>
                
                <div style={{ animationDelay: '200ms' }} className="animate-fade-in-up space-y-4 flex flex-col justify-center">
                     <TrendIndicator trend={result.trend} />
                     <ActionIndicator action={result.action} />
                </div>
            </div>

            <div style={{ animationDelay: '300ms' }} className="animate-fade-in-up bg-panel-color backdrop-blur-sm p-6 rounded-xl border border-border-color">
                <h3 className="text-xl font-bold text-[var(--accent-color)] mb-2">Analysis Summary</h3>
                <p className="text-text-primary">{result.summary}</p>
            </div>
            
            <div style={{ animationDelay: '400ms' }} className="animate-fade-in-up bg-panel-color backdrop-blur-sm rounded-xl border border-border-color">
                <div className="border-b border-border-color flex flex-wrap sm:flex-nowrap space-x-2 px-4">
                    <TabButton id="overview" label="Overview" />
                    <TabButton id="indicators" label="Indicators" />
                    <TabButton id="advanced" label="Advanced Analysis" />
                    <TabButton id="risk" label="Trade Plan & Risk" />
                    <TabButton id="context" label="Context" />
                </div>
                <div className="p-6">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};