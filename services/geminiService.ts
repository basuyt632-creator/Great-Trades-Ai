import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, UserSettings } from '../types';
import { TradeTrend, TradeAction, IndicatorSignal } from '../types';


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

const getPersonalityPrompt = (personality: string) => {
    switch (personality) {
        case 'Concise':
            return 'Your analysis should be brief and to the point. Focus on the most critical information.';
        case 'Educational':
            return 'Your analysis should be highly detailed and educational. Explain the "why" behind your observations, defining key terms and patterns for a learning audience.';
        case 'Detailed':
        default:
            return 'Your analysis must be extremely thorough. Scrutinize every detail, including: trend lines, support and resistance levels, key swing points (highs and lows), candlestick patterns (e.g., Doji, Hammer, Engulfing patterns), and common chart patterns (e.g., Head and Shoulders, Triangles, Flags).';
    }
}

export const analyzeChartImage = async (imageFile: File, settings: UserSettings): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = await fileToGenerativePart(imageFile);

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      isChart: {
        type: Type.BOOLEAN,
        description: 'Set to true if the image is a financial trading chart, otherwise set to false.'
      },
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
        description: 'A multi-sentence, in-depth analysis explaining the reasoning, identifying patterns, indicators, and potential price movements. This should be a comprehensive narrative.'
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
      },
      priceTarget: {
        type: Type.STRING,
        description: 'Potential price targets based on technical analysis (e.g., "Upside: $150, Downside: $120"). If unclear, return "N/A".'
      },
      stopLoss: {
        type: Type.STRING,
        description: 'A suggested stop-loss level based on recent price action and support/resistance. This should be sensitive to the user\'s budget and risk tolerance.'
      },
      volatility: {
        type: Type.STRING,
        enum: ['Low', 'Medium', 'High', 'Very High'],
        description: 'An assessment of the current market volatility based on the chart.'
      },
      rsi: {
        type: Type.OBJECT,
        description: "Analysis of the Relative Strength Index (RSI).",
        properties: {
          value: { type: Type.NUMBER, description: "The current RSI value." },
          signal: { type: Type.STRING, enum: [IndicatorSignal.OVERSOLD, IndicatorSignal.OVERBOUGHT, IndicatorSignal.NEUTRAL], description: "Signal based on the RSI value." },
          interpretation: { type: Type.STRING, description: "A brief interpretation of what the RSI indicates." }
        },
        required: ['value', 'signal', 'interpretation']
      },
      macd: {
        type: Type.OBJECT,
        description: "Analysis of the Moving Average Convergence Divergence (MACD).",
        properties: {
          macdLine: { type: Type.NUMBER, description: "The value of the MACD line." },
          signalLine: { type: Type.NUMBER, description: "The value of the signal line." },
          histogram: { type: Type.NUMBER, description: "The value of the MACD histogram." },
          signal: { type: Type.STRING, enum: [IndicatorSignal.BULLISH_CROSSOVER, IndicatorSignal.BEARISH_CROSSOVER, IndicatorSignal.NEUTRAL], description: "Signal based on the MACD lines and histogram." },
          interpretation: { type: Type.STRING, description: "A brief interpretation of the MACD." }
        },
        required: ['macdLine', 'signalLine', 'histogram', 'signal', 'interpretation']
      },
      movingAverages: {
        type: Type.OBJECT,
        description: "Analysis of short-term and long-term moving averages.",
        properties: {
          shortTerm: { type: Type.OBJECT, properties: { period: { type: Type.INTEGER }, value: { type: Type.NUMBER } }, required: ['period', 'value'] },
          longTerm: { type: Type.OBJECT, properties: { period: { type: Type.INTEGER }, value: { type: Type.NUMBER } }, required: ['period', 'value'] },
          signal: { type: Type.STRING, enum: [IndicatorSignal.BULLISH_CROSSOVER, IndicatorSignal.BEARISH_CROSSOVER, IndicatorSignal.NEUTRAL], description: "Signal from MA crossovers (e.g., Golden Cross, Death Cross)." },
          interpretation: { type: Type.STRING, description: "Interpretation of the relationship between the moving averages." }
        },
        required: ['shortTerm', 'longTerm', 'signal', 'interpretation']
      },
      bollingerBands: {
        type: Type.OBJECT,
        description: "Analysis of Bollinger Bands.",
        properties: {
          upperBand: { type: Type.NUMBER, description: "Value of the upper band." },
          middleBand: { type: Type.NUMBER, description: "Value of the middle band (usually a simple moving average)." },
          lowerBand: { type: Type.NUMBER, description: "Value of the lower band." },
          signal: { type: Type.STRING, enum: [IndicatorSignal.EXPANDING, IndicatorSignal.CONTRACTING, IndicatorSignal.NEUTRAL], description: "Signal based on band width (volatility)." },
          interpretation: { type: Type.STRING, description: "Interpretation of the price action relative to the bands." }
        },
        required: ['upperBand', 'middleBand', 'lowerBand', 'signal', 'interpretation']
      },
      volumeAnalysis: {
        type: Type.STRING,
        description: "A detailed analysis of trading volume. Comment on trends, spikes, and how volume confirms or contradicts price action."
      },
      marketSentiment: {
        type: Type.STRING,
        description: "An assessment of the overall market sentiment (e.g., 'Extreme Greed', 'Fear', 'Neutral')."
      },
      riskRewardRatio: {
        type: Type.STRING,
        description: "An estimated risk/reward ratio for the recommended trade action, presented as a ratio (e.g., '1:3'). If not applicable, return 'N/A'."
      },
      alternativeScenario: {
        type: Type.OBJECT,
        description: "Description of what might happen if the primary analysis is incorrect.",
        properties: {
          bullish: { type: Type.STRING, description: "An alternative bullish scenario or what would need to happen for the outlook to turn bullish." },
          bearish: { type: Type.STRING, description: "An alternative bearish scenario or what would need to happen for the outlook to turn bearish." }
        },
        required: ['bullish', 'bearish']
      },
      educationalInsight: {
        type: Type.STRING,
        description: "A short, educational paragraph explaining a key concept or pattern identified in the chart (e.g., 'What is a Head and Shoulders pattern?')."
      },
      elliottWave: {
        type: Type.OBJECT,
        description: "Analysis based on Elliott Wave theory.",
        properties: {
          currentWave: { type: Type.STRING, description: "Identified current wave count (e.g., 'Wave 3 of a larger impulse', 'Corrective Wave C'). If not clear, return 'N/A'." },
          interpretation: { type: Type.STRING, description: "Interpretation of the current Elliott Wave structure and its implications for future price movement." }
        },
        required: ['currentWave', 'interpretation']
      },
      fibonacciAnalysis: {
        type: Type.OBJECT,
        description: "Analysis of Fibonacci retracement and extension levels.",
        properties: {
          keyRetracementLevels: { type: Type.STRING, description: "Key Fibonacci retracement levels (e.g., 0.382, 0.50, 0.618) acting as support or resistance." },
          keyExtensionLevels: { type: Type.STRING, description: "Potential price targets based on Fibonacci extension levels (e.g., 1.618, 2.618)." },
          interpretation: { type: Type.STRING, description: "Interpretation of how the price is reacting to these Fibonacci levels." }
        },
        required: ['keyRetracementLevels', 'keyExtensionLevels', 'interpretation']
      },
      ichimokuCloud: {
        type: Type.OBJECT,
        description: "Analysis of the Ichimoku Cloud indicator.",
        properties: {
          signal: { type: Type.STRING, enum: [IndicatorSignal.STRONG_BUY, IndicatorSignal.BUY, IndicatorSignal.NEUTRAL, IndicatorSignal.SELL, IndicatorSignal.STRONG_SELL], description: "The overall signal from the Ichimoku Cloud analysis." },
          interpretation: { type: Type.STRING, description: "A detailed interpretation of the Ichimoku Cloud components (Tenkan-sen, Kijun-sen, Senkou Span A/B, Chikou Span) and what they collectively signal." }
        },
        required: ['signal', 'interpretation']
      },
      tradeSetup: {
        type: Type.OBJECT,
        description: "A detailed, actionable trade setup based on the analysis.",
        properties: {
          entryStrategy: { type: Type.STRING, description: "A specific strategy for entering a trade (e.g., 'Enter on a breakout above resistance at $X', 'Wait for a pullback to support at $Y')." },
          profitTargets: { type: Type.STRING, description: "Multiple potential profit-taking levels (e.g., 'Target 1: $A, Target 2: $B')." },
          stopLossStrategy: { type: Type.STRING, description: "A specific strategy for placing a stop-loss (e.g., 'Place stop-loss below the recent swing low at $Z')." },
          rationale: { type: Type.STRING, description: "The core reasoning behind this specific trade setup, linking together various analytical points." }
        },
        required: ['entryStrategy', 'profitTargets', 'stopLossStrategy', 'rationale']
      },
      confluenceFactors: {
        type: Type.STRING,
        description: "A list of converging signals from different indicators or patterns that strengthen the analysis (e.g., 'RSI divergence aligns with bearish crossover on MACD and rejection from the 50-day moving average.')."
      },
    },
    required: [
        'isChart', 'trend', 'action', 'confidence', 'summary', 'detailedAnalysis', 
        'keyPatterns', 'supportLevel', 'resistanceLevel', 'swingPoints', 'candlestickAnalysis', 
        'priceTarget', 'stopLoss', 'volatility', 'rsi', 'macd', 'movingAverages', 'bollingerBands', 
        'volumeAnalysis', 'marketSentiment', 'riskRewardRatio', 'alternativeScenario', 'educationalInsight',
        'elliottWave', 'fibonacciAnalysis', 'ichimokuCloud', 'tradeSetup', 'confluenceFactors'
    ]
  };

  const userContext = `
The user has provided the following context for their analysis request:
- Chart Time Frame: ${settings.defaultTimeFrame}
- Trading Style: ${settings.userPreferences.tradingStyle || 'Not specified'}
- Primary Goal: ${settings.userPreferences.primaryGoal || 'Not specified'}
- Risk Tolerance: ${settings.userPreferences.riskTolerance || 'Not specified'}
- Investment Horizon: ${settings.userPreferences.investmentHorizon || 'Not specified'}
- Preferred Trading Strategies: ${settings.userPreferences.tradeStrategies?.join(', ') || 'Not specified'}
- Trade Budget: ${settings.userPreferences.tradeBudget || 'Not specified'}
- Portfolio Exposure: ${settings.userPreferences.portfolioExposure || 'Not specified'}

Please tailor your analysis to this context. For example, if the user is a day trader on a 5-minute chart, focus on short-term signals. For a user with a small budget, suggest tighter stop-losses to prioritize capital preservation.
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
          systemInstruction: `You are a world-class trading chart analyst with deep expertise in multiple methodologies. Your primary task is to perform an extremely careful and detailed analysis of financial charts. First, evaluate if the image is a financial chart. If not, set 'isChart' to false and populate all other fields with neutral or "N/A" values. Otherwise, assume it IS a chart, set 'isChart' to true, and proceed with an exceptionally thorough analysis. Your analysis must be 20x more detailed than a standard one. You must scrutinize every detail and incorporate advanced techniques. Specifically provide deep insights on: Candlestick patterns, classic chart patterns, volume analysis, market sentiment, multiple technical indicators (RSI, MACD, MAs, Bollinger Bands), Elliott Wave theory, Fibonacci levels, and Ichimoku Cloud signals. Based on a synthesis of all these factors, provide a holistic and objective analysis. You must fill out ALL fields in the provided JSON schema. Do not provide financial advice. Your goal is to provide a high-quality, professional-grade technical breakdown, not a guaranteed prediction. **This is not a simple analysis; it requires you to act as a seasoned professional analyst, finding subtle clues and confluence between different analytical methods to build a strong, evidence-based case for your findings.** IMPORTANT: The user has requested the response in ${settings.defaultLanguage}. All string fields in your JSON response must be translated into ${settings.defaultLanguage}.` + userContext,
          responseMimeType: "application/json",
          responseSchema: responseSchema,
      },
    });

    let responseText = response.text.trim();
    
    // The Gemini API can sometimes wrap the JSON response in markdown or other text.
    // This cleaning step extracts the main JSON object from the response string
    // to ensure it can be parsed correctly, even if the response is not perfectly formatted.
    const startIndex = responseText.indexOf('{');
    const endIndex = responseText.lastIndexOf('}');

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new Error("Could not find a valid JSON object in the model's response.");
    }

    responseText = responseText.substring(startIndex, endIndex + 1);
    
    const parsedJson = JSON.parse(responseText) as AnalysisResult;

    if (!parsedJson.isChart) {
      throw new Error("No chart found. The uploaded image does not appear to be a trading chart.");
    }

    if (parsedJson.confidence < 0) parsedJson.confidence = 0;
    if (parsedJson.confidence > 100) parsedJson.confidence = 100;

    return parsedJson;

  } catch (error) {
    console.error("Error analyzing chart:", error);
    if (error instanceof Error) {
        if (error.message.includes('No chart found')) {
            throw error;
        }
        // Heuristic checks for common API issues
        if (error.message.toLowerCase().includes('api key not valid')) {
            throw new Error("API key is not valid. Please check your configuration.");
        }
        if (error.message.toLowerCase().includes('billing')) {
            throw new Error("There's an issue with your billing account. Please check your Google AI Studio settings.");
        }
        if (error.message.toLowerCase().includes('429')) {
             throw new Error("The analysis service is currently busy. Please try again in a moment.");
        }
        if (error.message.toLowerCase().includes('json')) {
             throw new Error("The AI returned an invalid analysis format. This may be a temporary issue. Please try again.");
        }
        // Fallback for other errors from the service
        throw new Error(`Analysis failed due to a service error. Please try again later.`);
    }
    // Fallback for non-Error objects
    throw new Error("An unknown error occurred during analysis.");
  }
};