import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';
import { TradeTrend, TradeAction } from '../types';


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });

  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeChartImage = async (imageFile: File, timeFrame: string, userPreferences: Record<string, string>): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      trend: {
        type: Type.STRING,
        enum: [TradeTrend.BULLISH, TradeTrend.BEARISH, TradeTrend.NEUTRAL],
        description: 'The overall market trend identified from the chart.'
      },
      action: {
        type: Type.STRING,
        enum: [TradeAction.BUY, TradeAction.SELL, TradeAction.HOLD],
        description: 'The recommended trading action based on the analysis.'
      },
      confidence: {
        type: Type.NUMBER,
        description: 'A confidence score from 0 to 100 for the recommended action.'
      },
      summary: {
        type: Type.STRING,
        description: 'A concise, one-sentence summary of the chart analysis.'
      },
      detailedAnalysis: {
        type: Type.STRING,
        description: 'A multi-sentence, in-depth analysis explaining the reasoning, identifying patterns, indicators, and potential price movements.'
      },
      keyPatterns: {
        type: Type.STRING,
        description: 'Identified chart patterns (e.g., "Head and Shoulders, Bullish Engulfing"). If none, return "N/A".'
      },
      supportLevel: {
        type: Type.STRING,
        description: 'The key support price level identified. If none, return "N/A".'
      },
      resistanceLevel: {
        type: Type.STRING,
        description: 'The key resistance price level identified. If none, return "N/A".'
      },
      swingPoints: {
        type: Type.STRING,
        description: 'Key swing high and swing low price levels identified. If none, return "N/A".'
      },
      candlestickAnalysis: {
        type: Type.STRING,
        description: 'Analysis of recent significant candlestick patterns and what they indicate (e.g., "Doji suggests indecision", "Bullish engulfing indicates reversal"). If none significant, return "N/A".'
      }
    },
    required: ['trend', 'action', 'confidence', 'summary', 'detailedAnalysis', 'keyPatterns', 'supportLevel', 'resistanceLevel', 'swingPoints', 'candlestickAnalysis']
  };

  const userContext = `
The user has provided the following context for their analysis request:
- Chart Time Frame: ${timeFrame}
- Trading Style: ${userPreferences.tradingStyle || 'Not specified'}
- Primary Goal: ${userPreferences.primaryGoal || 'Not specified'}
- Risk Tolerance: ${userPreferences.riskTolerance || 'Not specified'}
- Investment Horizon: ${userPreferences.investmentHorizon || 'Not specified'}

Please tailor your analysis to this context. For example, if the user is a day trader on a 5-minute chart, focus on short-term signals and intraday patterns. If their goal is risk assessment, highlight potential pitfalls and stop-loss levels.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [
          imagePart,
          { text: "Analyze this financial trading chart in exhaustive detail, focusing on providing an accurate and comprehensive technical analysis." }
        ]
      }],
      config: {
          systemInstruction: "You are an expert trading chart analyst. Your task is to analyze the provided financial chart image and return a structured JSON object with your findings. Your analysis must be extremely thorough. Scrutinize every detail, including: trend lines, support and resistance levels, key swing points (highs and lows), candlestick patterns (e.g., Doji, Hammer, Engulfing patterns), and common chart patterns (e.g., Head and Shoulders, Triangles, Flags). Based on a synthesis of all these factors, provide an objective analysis. Do not provide financial advice. The user is from India, so use simple language for confidence ('संभावित सटीकता' means 'chance of being correct'). Your goal is to provide a high-quality, detailed technical breakdown, not a guaranteed prediction." + userContext,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
      },
    });

    const responseText = response.text.trim();
    const parsedJson = JSON.parse(responseText) as AnalysisResult;

    if (parsedJson.confidence < 0) parsedJson.confidence = 0;
    if (parsedJson.confidence > 100) parsedJson.confidence = 100;

    return parsedJson;

  } catch (error) {
    console.error("Error analyzing chart:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to analyze chart: ${error.message}`);
    }
    throw new Error("An unknown error occurred during analysis.");
  }
};