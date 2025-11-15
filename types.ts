export enum TradeTrend {
  BULLISH = 'Bullish',
  BEARISH = 'Bearish',
  NEUTRAL = 'Neutral',
}

export enum TradeAction {
  BUY = 'Buy',
  SELL = 'Sell',
  HOLD = 'Hold',
}

export enum IndicatorSignal {
    STRONG_BUY = 'Strong Buy',
    BUY = 'Buy',
    NEUTRAL = 'Neutral',
    SELL = 'Sell',
    STRONG_SELL = 'Strong Sell',
    OVERSOLD = 'Oversold',
    OVERBOUGHT = 'Overbought',
    BULLISH_CROSSOVER = 'Bullish Crossover',
    BEARISH_CROSSOVER = 'Bearish Crossover',
    EXPANDING = 'Expanding',
    CONTRACTING = 'Contracting',
}

// Fix: Added missing TrendLine interface.
export interface TrendLine {
    type: 'support' | 'resistance' | 'trend';
    points: { x: number; y: number }[];
    label: string;
}

export interface RsiAnalysis {
    value: number;
    signal: IndicatorSignal;
    interpretation: string;
}

export interface MacdAnalysis {
    macdLine: number;
    signalLine: number;
    histogram: number;
    signal: IndicatorSignal;
    interpretation: string;
}

export interface MovingAverageAnalysis {
    shortTerm: { period: number; value: number; };
    longTerm: { period: number; value: number; };
    signal: IndicatorSignal;
    interpretation: string;
}

export interface BollingerBandsAnalysis {
    upperBand: number;
    middleBand: number;
    lowerBand: number;
    signal: IndicatorSignal;
    interpretation: string;
}

export interface ElliottWaveAnalysis {
    currentWave: string;
    interpretation: string;
}

export interface FibonacciAnalysis {
    keyRetracementLevels: string;
    keyExtensionLevels: string;
    interpretation: string;
}

export interface IchimokuCloudAnalysis {
    signal: IndicatorSignal;
    interpretation: string;
}

export interface TradeSetup {
    entryStrategy: string;
    profitTargets: string;
    stopLossStrategy: string;
    rationale: string;
}

export interface AnalysisResult {
  isChart: boolean;
  trend: TradeTrend;
  action: TradeAction;
  confidence: number;
  summary: string;
  detailedAnalysis: string;
  keyPatterns: string;
  supportLevel: string;
  resistanceLevel: string;
  swingPoints: string;
  candlestickAnalysis: string;
  priceTarget: string;
  stopLoss: string;
  volatility: string;
  rsi: RsiAnalysis;
  macd: MacdAnalysis;
  movingAverages: MovingAverageAnalysis;
  bollingerBands: BollingerBandsAnalysis;
  volumeAnalysis: string;
  marketSentiment: string;
  riskRewardRatio: string;
  alternativeScenario: {
      bullish: string;
      bearish: string;
  };
  educationalInsight: string;
  elliottWave: ElliottWaveAnalysis;
  fibonacciAnalysis: FibonacciAnalysis;
  ichimokuCloud: IchimokuCloudAnalysis;
  tradeSetup: TradeSetup;
  confluenceFactors: string;
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  thumbnailDataUrl: string;
  result: AnalysisResult;
}

export interface UserPreferences {
  tradingStyle: string;
  primaryGoal: string;
  riskTolerance: string;
  investmentHorizon: string;
  tradeStrategies: string[];
  tradeBudget: string;
  portfolioExposure: string;
}

export type AIPersonality = 'Concise' | 'Detailed' | 'Educational';
export type UIDensity = 'Comfortable' | 'Compact';

export interface UserSettings {
    userPreferences: UserPreferences;
    aiPersonality: AIPersonality;
    defaultLanguage: string;
    defaultTimeFrame: string;
    accentColor: string;
    uiDensity: UIDensity;
    historyTrackingEnabled: boolean;
}
