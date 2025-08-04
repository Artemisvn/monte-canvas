// Advanced Technical Analysis Library

export interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  id: string;
  name: string;
  type: 'overlay' | 'oscillator';
  parameters: Record<string, number>;
  data: { time: string; value: number }[];
}

export class TechnicalAnalysis {
  // Simple Moving Average
  static sma(data: CandlestickData[], period: number): { time: string; value: number }[] {
    const result: { time: string; value: number }[] = [];
    
    for (let i = period - 1; i < data.length; i++) {
      const slice = data.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, candle) => acc + candle.close, 0);
      const average = sum / period;
      
      result.push({
        time: data[i].time,
        value: average
      });
    }
    
    return result;
  }

  // Exponential Moving Average
  static ema(data: CandlestickData[], period: number): { time: string; value: number }[] {
    const result: { time: string; value: number }[] = [];
    const multiplier = 2 / (period + 1);
    
    if (data.length === 0) return result;
    
    // First EMA value is SMA
    let ema = data.slice(0, period).reduce((acc, candle) => acc + candle.close, 0) / period;
    result.push({ time: data[period - 1].time, value: ema });
    
    // Calculate subsequent EMA values
    for (let i = period; i < data.length; i++) {
      ema = (data[i].close - ema) * multiplier + ema;
      result.push({ time: data[i].time, value: ema });
    }
    
    return result;
  }

  // Relative Strength Index
  static rsi(data: CandlestickData[], period: number = 14): { time: string; value: number }[] {
    const result: { time: string; value: number }[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Calculate initial average gain/loss
    let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;
    
    for (let i = period; i < data.length; i++) {
      // Smoothed average
      avgGain = (avgGain * (period - 1) + gains[i - 1]) / period;
      avgLoss = (avgLoss * (period - 1) + losses[i - 1]) / period;
      
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      
      result.push({
        time: data[i].time,
        value: rsi
      });
    }
    
    return result;
  }

  // MACD (Moving Average Convergence Divergence)
  static macd(data: CandlestickData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const fastEMA = this.ema(data, fastPeriod);
    const slowEMA = this.ema(data, slowPeriod);
    
    const macdLine: { time: string; value: number }[] = [];
    
    // Calculate MACD line
    const startIndex = Math.max(fastEMA.length, slowEMA.length) - Math.min(fastEMA.length, slowEMA.length);
    for (let i = startIndex; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push({
        time: fastEMA[i].time,
        value: fastEMA[i].value - slowEMA[i].value
      });
    }
    
    // Calculate signal line (EMA of MACD)
    const signalLine: { time: string; value: number }[] = [];
    const multiplier = 2 / (signalPeriod + 1);
    
    if (macdLine.length >= signalPeriod) {
      let signal = macdLine.slice(0, signalPeriod).reduce((acc, point) => acc + point.value, 0) / signalPeriod;
      signalLine.push({ time: macdLine[signalPeriod - 1].time, value: signal });
      
      for (let i = signalPeriod; i < macdLine.length; i++) {
        signal = (macdLine[i].value - signal) * multiplier + signal;
        signalLine.push({ time: macdLine[i].time, value: signal });
      }
    }
    
    // Calculate histogram
    const histogram: { time: string; value: number }[] = [];
    for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
      histogram.push({
        time: macdLine[i + Math.max(0, macdLine.length - signalLine.length)].time,
        value: macdLine[i + Math.max(0, macdLine.length - signalLine.length)].value - signalLine[i].value
      });
    }
    
    return { macdLine, signalLine, histogram };
  }

  // Bollinger Bands
  static bollingerBands(data: CandlestickData[], period: number = 20, stdDev: number = 2) {
    const sma = this.sma(data, period);
    const bands = {
      upper: [] as { time: string; value: number }[],
      middle: sma,
      lower: [] as { time: string; value: number }[]
    };
    
    for (let i = 0; i < sma.length; i++) {
      const dataIndex = i + period - 1;
      const slice = data.slice(dataIndex - period + 1, dataIndex + 1);
      const mean = sma[i].value;
      
      // Calculate standard deviation
      const variance = slice.reduce((acc, candle) => acc + Math.pow(candle.close - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      bands.upper.push({
        time: sma[i].time,
        value: mean + (stdDev * standardDeviation)
      });
      
      bands.lower.push({
        time: sma[i].time,
        value: mean - (stdDev * standardDeviation)
      });
    }
    
    return bands;
  }

  // Volume Weighted Average Price
  static vwap(data: CandlestickData[]): { time: string; value: number }[] {
    const result: { time: string; value: number }[] = [];
    let cumulativePV = 0;
    let cumulativeVolume = 0;
    
    for (const candle of data) {
      const typicalPrice = (candle.high + candle.low + candle.close) / 3;
      cumulativePV += typicalPrice * candle.volume;
      cumulativeVolume += candle.volume;
      
      result.push({
        time: candle.time,
        value: cumulativeVolume > 0 ? cumulativePV / cumulativeVolume : typicalPrice
      });
    }
    
    return result;
  }

  // Stochastic Oscillator
  static stochastic(data: CandlestickData[], kPeriod: number = 14, dPeriod: number = 3): {
    k: { time: string; value: number }[];
    d: { time: string; value: number }[];
  } {
    const kValues: { time: string; value: number }[] = [];
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const slice = data.slice(i - kPeriod + 1, i + 1);
      const highest = Math.max(...slice.map(c => c.high));
      const lowest = Math.min(...slice.map(c => c.low));
      const current = data[i].close;
      
      const k = highest !== lowest ? ((current - lowest) / (highest - lowest)) * 100 : 50;
      kValues.push({ time: data[i].time, value: k });
    }
    
    // Calculate %D (SMA of %K)
    const dValues: { time: string; value: number }[] = [];
    for (let i = dPeriod - 1; i < kValues.length; i++) {
      const slice = kValues.slice(i - dPeriod + 1, i + 1);
      const average = slice.reduce((acc, point) => acc + point.value, 0) / dPeriod;
      dValues.push({ time: kValues[i].time, value: average });
    }
    
    return { k: kValues, d: dValues };
  }

  // Average True Range
  static atr(data: CandlestickData[], period: number = 14): { time: string; value: number }[] {
    const trueRanges: number[] = [];
    
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high;
      const low = data[i].low;
      const prevClose = data[i - 1].close;
      
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      );
      
      trueRanges.push(tr);
    }
    
    const result: { time: string; value: number }[] = [];
    
    // Initial ATR (SMA of first period true ranges)
    let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
    result.push({ time: data[period].time, value: atr });
    
    // Subsequent ATR values (smoothed)
    for (let i = period; i < trueRanges.length; i++) {
      atr = (atr * (period - 1) + trueRanges[i]) / period;
      result.push({ time: data[i + 1].time, value: atr });
    }
    
    return result;
  }

  // Generate sample market data
  static generateSampleData(symbol: string, days: number = 252): CandlestickData[] {
    const data: CandlestickData[] = [];
    let basePrice = 100 + Math.random() * 400; // Random starting price between 100-500
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      
      // Generate price movement with some trend and volatility
      const trend = Math.sin(i / 50) * 0.002; // Long-term trend
      const volatility = 0.02 + Math.random() * 0.03; // 2-5% daily volatility
      const change = (Math.random() - 0.5) * volatility + trend;
      
      const open = i === 0 ? basePrice : data[i - 1].close;
      const close = open * (1 + change);
      
      // Generate high/low based on volatility
      const dayRange = Math.abs(close - open) + (Math.random() * open * 0.01);
      const high = Math.max(open, close) + Math.random() * dayRange;
      const low = Math.min(open, close) - Math.random() * dayRange;
      
      // Generate volume (higher volume on bigger moves)
      const baseVolume = 1000000 + Math.random() * 2000000;
      const volumeMultiplier = 1 + Math.abs(change) * 10;
      const volume = Math.floor(baseVolume * volumeMultiplier);
      
      data.push({
        time: date.toISOString().split('T')[0],
        open: Number(open.toFixed(2)),
        high: Number(high.toFixed(2)),
        low: Number(low.toFixed(2)),
        close: Number(close.toFixed(2)),
        volume
      });
      
      basePrice = close;
    }
    
    return data;
  }
}