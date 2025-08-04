// Monte Carlo simulation utilities

interface SimulationParams {
  currentPrice: number;
  expectedReturn: number;
  volatility: number;
  timeHorizon: number;
  numSimulations: number;
}

interface SimulationResults {
  paths: number[][];
  finalPrices: number[];
  statistics: {
    averageEndingPrice: number;
    probabilityOfGain: number;
    percentile5: number;
    percentile95: number;
    maxPrice: number;
    minPrice: number;
  };
}

interface StockData {
  currentPrice: number;
  expectedReturn: number;
  volatility: number;
}

// Generate random normal distribution using Box-Muller transform
function randomNormal(): number {
  let u = 0, v = 0;
  while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

// Geometric Brownian Motion simulation
export function runMonteCarloSimulation(params: SimulationParams): SimulationResults {
  const { currentPrice, expectedReturn, volatility, timeHorizon, numSimulations } = params;
  
  const paths: number[][] = [];
  const finalPrices: number[] = [];
  
  // Daily parameters
  const dt = 1 / 252; // Daily time step (252 trading days per year)
  const drift = (expectedReturn - 0.5 * volatility * volatility) * dt;
  const diffusion = volatility * Math.sqrt(dt);
  
  // Generate simulation paths
  for (let sim = 0; sim < numSimulations; sim++) {
    const path: number[] = [currentPrice];
    let price = currentPrice;
    
    for (let day = 1; day <= timeHorizon; day++) {
      const randomShock = randomNormal();
      const priceChange = drift + diffusion * randomShock;
      price = price * Math.exp(priceChange);
      path.push(price);
    }
    
    paths.push(path);
    finalPrices.push(price);
  }
  
  // Calculate statistics
  finalPrices.sort((a, b) => a - b);
  
  const averageEndingPrice = finalPrices.reduce((sum, price) => sum + price, 0) / finalPrices.length;
  const probabilityOfGain = finalPrices.filter(price => price > currentPrice).length / finalPrices.length;
  const percentile5 = finalPrices[Math.floor(finalPrices.length * 0.05)];
  const percentile95 = finalPrices[Math.floor(finalPrices.length * 0.95)];
  const maxPrice = Math.max(...finalPrices);
  const minPrice = Math.min(...finalPrices);
  
  return {
    paths,
    finalPrices,
    statistics: {
      averageEndingPrice,
      probabilityOfGain,
      percentile5,
      percentile95,
      maxPrice,
      minPrice,
    },
  };
}

// Fetch stock data (demo implementation)
export async function fetchStockData(ticker: string): Promise<StockData> {
  // In a real implementation, this would fetch from a financial API
  // For demo purposes, we'll return realistic sample data
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Sample data for common stocks
  const sampleData: Record<string, StockData> = {
    'AAPL': { currentPrice: 175.25, expectedReturn: 0.12, volatility: 0.25 },
    'TSLA': { currentPrice: 245.80, expectedReturn: 0.15, volatility: 0.45 },
    'MSFT': { currentPrice: 378.50, expectedReturn: 0.11, volatility: 0.28 },
    'GOOGL': { currentPrice: 142.30, expectedReturn: 0.13, volatility: 0.30 },
    'AMZN': { currentPrice: 155.90, expectedReturn: 0.14, volatility: 0.35 },
    'NVDA': { currentPrice: 485.20, expectedReturn: 0.18, volatility: 0.50 },
    'META': { currentPrice: 325.75, expectedReturn: 0.16, volatility: 0.40 },
    'NFLX': { currentPrice: 445.60, expectedReturn: 0.10, volatility: 0.42 },
  };
  
  const data = sampleData[ticker.toUpperCase()];
  
  if (!data) {
    // Generate random realistic data for unknown tickers
    const currentPrice = Math.random() * 300 + 50; // Between $50-$350
    const expectedReturn = Math.random() * 0.20 + 0.05; // Between 5%-25%
    const volatility = Math.random() * 0.40 + 0.15; // Between 15%-55%
    
    return { currentPrice, expectedReturn, volatility };
  }
  
  return data;
}

// Calculate additional risk metrics
export function calculateRiskMetrics(finalPrices: number[], currentPrice: number, confidence: number = 0.05) {
  const sortedPrices = [...finalPrices].sort((a, b) => a - b);
  const returns = finalPrices.map(price => (price - currentPrice) / currentPrice);
  
  // Value at Risk (VaR)
  const varIndex = Math.floor(sortedPrices.length * confidence);
  const valueAtRisk = currentPrice - sortedPrices[varIndex];
  
  // Expected Shortfall (Conditional VaR)
  const worstReturns = returns.slice(0, varIndex + 1);
  const expectedShortfall = worstReturns.reduce((sum, ret) => sum + ret, 0) / worstReturns.length;
  
  // Sharpe Ratio (simplified, assuming risk-free rate of 3%)
  const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const returnStd = Math.sqrt(returns.reduce((sum, ret) => sum + Math.pow(ret - averageReturn, 2), 0) / returns.length);
  const sharpeRatio = (averageReturn - 0.03) / returnStd;
  
  return {
    valueAtRisk,
    expectedShortfall,
    sharpeRatio,
    maxDrawdown: (currentPrice - Math.min(...sortedPrices)) / currentPrice,
  };
}