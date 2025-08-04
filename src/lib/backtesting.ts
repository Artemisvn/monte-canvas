import { fetchRealStockData } from './monteCarlo';

// Core interfaces
export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface Trade {
  id: string;
  type: 'BUY' | 'SELL';
  symbol: string;
  price: number;
  quantity: number;
  timestamp: string;
  commission: number;
  slippage: number;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgPrice: number;
  unrealizedPnL: number;
  realizedPnL: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  volatility: number;
  winRate: number;
  profitFactor: number;
  calmarRatio: number;
  totalTrades: number;
  avgTrade: number;
  bestTrade: number;
  worstTrade: number;
  avgWinningTrade: number;
  avgLosingTrade: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

export interface BacktestResult {
  trades: Trade[];
  positions: Position[];
  portfolioValues: Array<{ date: string; value: number; drawdown: number }>;
  performance: PerformanceMetrics;
  signals: Array<{ date: string; signal: 'BUY' | 'SELL' | 'HOLD'; price: number; confidence?: number }>;
}

export interface BacktestParams {
  symbol: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
  strategy: TradingStrategy;
}

// Abstract strategy class
export abstract class TradingStrategy {
  abstract name: string;
  abstract description: string;
  abstract parameters: { [key: string]: any };

  abstract generateSignal(
    prices: HistoricalPrice[],
    currentIndex: number,
    position?: Position
  ): 'BUY' | 'SELL' | 'HOLD';

  abstract getPositionSize(
    signal: 'BUY' | 'SELL' | 'HOLD',
    currentPrice: number,
    availableCash: number,
    currentPosition?: Position
  ): number;

  // Technical indicators helpers
  protected sma(prices: number[], period: number, index: number): number | null {
    if (index < period - 1) return null;
    const sum = prices.slice(index - period + 1, index + 1).reduce((a, b) => a + b, 0);
    return sum / period;
  }

  protected ema(prices: number[], period: number, index: number): number | null {
    if (index === 0) return prices[0];
    if (index < period - 1) return null;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];
    
    for (let i = 1; i <= index; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  protected rsi(prices: number[], period: number, index: number): number | null {
    if (index < period) return null;
    
    let gains = 0;
    let losses = 0;
    
    for (let i = index - period + 1; i <= index; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    const avgGain = gains / period;
    const avgLoss = losses / period;
    
    if (avgLoss === 0) return 100;
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }

  protected bollinger(prices: number[], period: number, stdDev: number, index: number): { upper: number; middle: number; lower: number } | null {
    const sma = this.sma(prices, period, index);
    if (!sma) return null;
    
    const slice = prices.slice(index - period + 1, index + 1);
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const std = Math.sqrt(variance);
    
    return {
      upper: sma + (std * stdDev),
      middle: sma,
      lower: sma - (std * stdDev)
    };
  }
}

// Moving Average Crossover Strategy
export class MovingAverageCrossover extends TradingStrategy {
  name = "Moving Average Crossover";
  description = "Buy when fast MA crosses above slow MA, sell when it crosses below";
  parameters = {
    fastPeriod: 20,
    slowPeriod: 50,
    positionSize: 0.95 // Use 95% of available capital
  };

  constructor(fastPeriod: number = 20, slowPeriod: number = 50) {
    super();
    this.parameters.fastPeriod = fastPeriod;
    this.parameters.slowPeriod = slowPeriod;
  }

  generateSignal(prices: HistoricalPrice[], currentIndex: number, position?: Position): 'BUY' | 'SELL' | 'HOLD' {
    const closePrices = prices.map(p => p.close);
    
    const fastMA = this.sma(closePrices, this.parameters.fastPeriod, currentIndex);
    const slowMA = this.sma(closePrices, this.parameters.slowPeriod, currentIndex);
    const prevFastMA = this.sma(closePrices, this.parameters.fastPeriod, currentIndex - 1);
    const prevSlowMA = this.sma(closePrices, this.parameters.slowPeriod, currentIndex - 1);

    if (!fastMA || !slowMA || !prevFastMA || !prevSlowMA) return 'HOLD';

    // Buy signal: fast MA crosses above slow MA
    if (prevFastMA <= prevSlowMA && fastMA > slowMA && (!position || position.quantity === 0)) {
      return 'BUY';
    }
    
    // Sell signal: fast MA crosses below slow MA
    if (prevFastMA >= prevSlowMA && fastMA < slowMA && position && position.quantity > 0) {
      return 'SELL';
    }

    return 'HOLD';
  }

  getPositionSize(signal: 'BUY' | 'SELL' | 'HOLD', currentPrice: number, availableCash: number, currentPosition?: Position): number {
    if (signal === 'BUY') {
      const cashToUse = availableCash * this.parameters.positionSize;
      return Math.floor(cashToUse / currentPrice);
    } else if (signal === 'SELL' && currentPosition) {
      return currentPosition.quantity;
    }
    return 0;
  }
}

// RSI Mean Reversion Strategy
export class RSIMeanReversion extends TradingStrategy {
  name = "RSI Mean Reversion";
  description = "Buy when RSI is oversold, sell when overbought";
  parameters = {
    rsiPeriod: 14,
    oversoldLevel: 30,
    overboughtLevel: 70,
    positionSize: 0.5
  };

  constructor(rsiPeriod: number = 14, oversoldLevel: number = 30, overboughtLevel: number = 70) {
    super();
    this.parameters.rsiPeriod = rsiPeriod;
    this.parameters.oversoldLevel = oversoldLevel;
    this.parameters.overboughtLevel = overboughtLevel;
  }

  generateSignal(prices: HistoricalPrice[], currentIndex: number, position?: Position): 'BUY' | 'SELL' | 'HOLD' {
    const closePrices = prices.map(p => p.close);
    const rsi = this.rsi(closePrices, this.parameters.rsiPeriod, currentIndex);

    if (!rsi) return 'HOLD';

    // Buy when oversold and no position
    if (rsi < this.parameters.oversoldLevel && (!position || position.quantity === 0)) {
      return 'BUY';
    }
    
    // Sell when overbought and have position
    if (rsi > this.parameters.overboughtLevel && position && position.quantity > 0) {
      return 'SELL';
    }

    return 'HOLD';
  }

  getPositionSize(signal: 'BUY' | 'SELL' | 'HOLD', currentPrice: number, availableCash: number, currentPosition?: Position): number {
    if (signal === 'BUY') {
      const cashToUse = availableCash * this.parameters.positionSize;
      return Math.floor(cashToUse / currentPrice);
    } else if (signal === 'SELL' && currentPosition) {
      return currentPosition.quantity;
    }
    return 0;
  }
}

// Bollinger Bands Strategy
export class BollingerBands extends TradingStrategy {
  name = "Bollinger Bands";
  description = "Buy at lower band, sell at upper band";
  parameters = {
    period: 20,
    stdDev: 2,
    positionSize: 0.8
  };

  constructor(period: number = 20, stdDev: number = 2) {
    super();
    this.parameters.period = period;
    this.parameters.stdDev = stdDev;
  }

  generateSignal(prices: HistoricalPrice[], currentIndex: number, position?: Position): 'BUY' | 'SELL' | 'HOLD' {
    const closePrices = prices.map(p => p.close);
    const bands = this.bollinger(closePrices, this.parameters.period, this.parameters.stdDev, currentIndex);
    
    if (!bands) return 'HOLD';
    
    const currentPrice = prices[currentIndex].close;

    // Buy when price touches lower band
    if (currentPrice <= bands.lower && (!position || position.quantity === 0)) {
      return 'BUY';
    }
    
    // Sell when price touches upper band
    if (currentPrice >= bands.upper && position && position.quantity > 0) {
      return 'SELL';
    }

    return 'HOLD';
  }

  getPositionSize(signal: 'BUY' | 'SELL' | 'HOLD', currentPrice: number, availableCash: number, currentPosition?: Position): number {
    if (signal === 'BUY') {
      const cashToUse = availableCash * this.parameters.positionSize;
      return Math.floor(cashToUse / currentPrice);
    } else if (signal === 'SELL' && currentPosition) {
      return currentPosition.quantity;
    }
    return 0;
  }
}

// Backtesting Engine
export class BacktestEngine {
  private generateTradeId(): string {
    return `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async runBacktest(params: BacktestParams): Promise<BacktestResult> {
    const { symbol, startDate, endDate, initialCapital, commission, slippage, strategy } = params;
    
    // Generate synthetic historical data (in real app, fetch from API)
    const historicalData = await this.generateHistoricalData(symbol, startDate, endDate);
    
    const trades: Trade[] = [];
    const signals: Array<{ date: string; signal: 'BUY' | 'SELL' | 'HOLD'; price: number }> = [];
    const portfolioValues: Array<{ date: string; value: number; drawdown: number }> = [];
    
    let cash = initialCapital;
    let position: Position | undefined;
    let portfolioValue = initialCapital;
    let peak = initialCapital;

    for (let i = 0; i < historicalData.length; i++) {
      const currentPrice = historicalData[i];
      const signal = strategy.generateSignal(historicalData, i, position);
      
      signals.push({
        date: currentPrice.date,
        signal,
        price: currentPrice.close
      });

      if (signal !== 'HOLD') {
        const quantity = strategy.getPositionSize(signal, currentPrice.close, cash, position);
        
        if (quantity > 0) {
          const trade: Trade = {
            id: this.generateTradeId(),
            type: signal,
            symbol,
            price: currentPrice.close * (1 + (signal === 'BUY' ? slippage : -slippage)),
            quantity,
            timestamp: currentPrice.date,
            commission,
            slippage: currentPrice.close * slippage * quantity
          };

          if (signal === 'BUY') {
            const totalCost = trade.price * quantity + commission;
            if (totalCost <= cash) {
              cash -= totalCost;
              position = {
                symbol,
                quantity: (position?.quantity || 0) + quantity,
                avgPrice: position 
                  ? ((position.avgPrice * position.quantity) + (trade.price * quantity)) / (position.quantity + quantity)
                  : trade.price,
                unrealizedPnL: 0,
                realizedPnL: position?.realizedPnL || 0
              };
              trades.push(trade);
            }
          } else if (signal === 'SELL' && position && position.quantity >= quantity) {
            const totalReceived = trade.price * quantity - commission;
            cash += totalReceived;
            
            const realizedPnL = (trade.price - position.avgPrice) * quantity - commission;
            position.realizedPnL += realizedPnL;
            position.quantity -= quantity;
            
            if (position.quantity === 0) {
              position = undefined;
            }
            trades.push(trade);
          }
        }
      }

      // Update portfolio value and drawdown
      const positionValue = position ? position.quantity * currentPrice.close : 0;
      portfolioValue = cash + positionValue;
      
      if (portfolioValue > peak) peak = portfolioValue;
      const drawdown = (peak - portfolioValue) / peak;

      portfolioValues.push({
        date: currentPrice.date,
        value: portfolioValue,
        drawdown
      });

      // Update unrealized PnL
      if (position) {
        position.unrealizedPnL = (currentPrice.close - position.avgPrice) * position.quantity;
      }
    }

    // Calculate performance metrics
    const performance = this.calculatePerformanceMetrics(trades, portfolioValues, initialCapital);

    return {
      trades,
      positions: position ? [position] : [],
      portfolioValues,
      performance,
      signals
    };
  }

  private async generateHistoricalData(symbol: string, startDate: string, endDate: string): Promise<HistoricalPrice[]> {
    // In a real application, this would fetch from a financial data API
    // For demo purposes, we'll generate synthetic but realistic data
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const data: HistoricalPrice[] = [];
    
    let currentPrice = 100; // Starting price
    const dailyVolatility = 0.02; // 2% daily volatility
    const drift = 0.0003; // Small positive drift
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate realistic OHLC data
      const change = (Math.random() - 0.5) * dailyVolatility + drift;
      const open = currentPrice;
      const close = open * (1 + change);
      const high = Math.max(open, close) * (1 + Math.random() * 0.01);
      const low = Math.min(open, close) * (1 - Math.random() * 0.01);
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close,
        volume,
        adjustedClose: close
      });
      
      currentPrice = close;
    }
    
    return data;
  }

  private calculatePerformanceMetrics(trades: Trade[], portfolioValues: Array<{ date: string; value: number; drawdown: number }>, initialCapital: number): PerformanceMetrics {
    if (portfolioValues.length === 0) {
      return this.getEmptyMetrics();
    }

    const finalValue = portfolioValues[portfolioValues.length - 1].value;
    const totalReturn = (finalValue - initialCapital) / initialCapital;
    
    // Calculate returns
    const returns = portfolioValues.slice(1).map((value, i) => 
      (value.value - portfolioValues[i].value) / portfolioValues[i].value
    );
    
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const annualizedReturn = Math.pow(1 + totalReturn, 252 / portfolioValues.length) - 1;
    
    // Calculate volatility
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length;
    const volatility = Math.sqrt(variance * 252); // Annualized
    
    // Calculate Sharpe ratio (assuming 2% risk-free rate)
    const riskFreeRate = 0.02;
    const sharpeRatio = volatility > 0 ? (annualizedReturn - riskFreeRate) / volatility : 0;
    
    // Calculate downside deviation for Sortino ratio
    const downsideReturns = returns.filter(ret => ret < 0);
    const downsideVariance = downsideReturns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length;
    const downsideDeviation = Math.sqrt(downsideVariance * 252);
    const sortinoRatio = downsideDeviation > 0 ? (annualizedReturn - riskFreeRate) / downsideDeviation : 0;
    
    // Calculate max drawdown
    const maxDrawdown = Math.max(...portfolioValues.map(pv => pv.drawdown));
    
    // Calculate Calmar ratio
    const calmarRatio = maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
    
    // Trade statistics
    const winningTrades = trades.filter(trade => {
      if (trade.type === 'SELL') {
        // Find corresponding buy trade and calculate profit
        return true; // Simplified for demo
      }
      return false;
    });
    
    const losingTrades = trades.filter(trade => trade.type === 'SELL').filter(trade => !winningTrades.includes(trade));
    
    const winRate = trades.length > 0 ? winningTrades.length / (winningTrades.length + losingTrades.length) : 0;
    
    const totalProfit = winningTrades.reduce((sum, trade) => sum + (trade.price * trade.quantity), 0);
    const totalLoss = losingTrades.reduce((sum, trade) => sum + (trade.price * trade.quantity), 0);
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    return {
      totalReturn,
      annualizedReturn,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      volatility,
      winRate,
      profitFactor,
      calmarRatio,
      totalTrades: trades.length,
      avgTrade: trades.length > 0 ? totalReturn / trades.length : 0,
      bestTrade: Math.max(...trades.map(t => t.price), 0),
      worstTrade: Math.min(...trades.map(t => t.price), 0),
      avgWinningTrade: winningTrades.length > 0 ? totalProfit / winningTrades.length : 0,
      avgLosingTrade: losingTrades.length > 0 ? totalLoss / losingTrades.length : 0,
      consecutiveWins: 0, // Simplified for demo
      consecutiveLosses: 0 // Simplified for demo
    };
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalReturn: 0,
      annualizedReturn: 0,
      sharpeRatio: 0,
      sortinoRatio: 0,
      maxDrawdown: 0,
      volatility: 0,
      winRate: 0,
      profitFactor: 0,
      calmarRatio: 0,
      totalTrades: 0,
      avgTrade: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgWinningTrade: 0,
      avgLosingTrade: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0
    };
  }
}

// Strategy factory
export const getAvailableStrategies = (): TradingStrategy[] => [
  new MovingAverageCrossover(),
  new RSIMeanReversion(),
  new BollingerBands()
];

export const createStrategy = (name: string, parameters?: any): TradingStrategy | null => {
  switch (name) {
    case 'Moving Average Crossover':
      return new MovingAverageCrossover(parameters?.fastPeriod, parameters?.slowPeriod);
    case 'RSI Mean Reversion':
      return new RSIMeanReversion(parameters?.rsiPeriod, parameters?.oversoldLevel, parameters?.overboughtLevel);
    case 'Bollinger Bands':
      return new BollingerBands(parameters?.period, parameters?.stdDev);
    default:
      return null;
  }
};