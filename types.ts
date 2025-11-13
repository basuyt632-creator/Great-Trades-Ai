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

export interface AnalysisResult {
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
}

export interface HistoryItem {
  id: number;
  timestamp: string;
  thumbnailDataUrl: string;
  result: AnalysisResult;
}
