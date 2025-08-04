import { runMonteCarloSimulation, fetchRealStockData } from './monteCarlo';

export interface Asset {
  ticker: string;
  name: string;
  weight: number;
  currentPrice?: number;
  expectedReturn?: number;
  volatility?: number;
}

export interface PortfolioParams {
  assets: Asset[];
  timeHorizon: number;
  numSimulations: number;
  correlationMethod: 'historical' | 'custom';
  customCorrelations?: number[][];
}

export interface PortfolioResults {
  paths: number[][];
  finalValues: number[];
  initialValue: number;
  assetPaths: { [ticker: string]: number[][] };
  statistics: {
    averageEndingValue: number;
    probabilityOfGain: number;
    percentile5: number;
    percentile95: number;
    maxValue: number;
    minValue: number;
    expectedReturn: number;
    volatility: number;
    sharpeRatio: number;
  };
  riskMetrics: {
    var95: number;
    var99: number;
    expectedShortfall: number;
    maxDrawdown: number;
  };
}

export interface EfficientFrontierPoint {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  weights: number[];
}

// Correlation matrix calculation
export const calculateCorrelationMatrix = (assets: Asset[]): number[][] => {
  const n = assets.length;
  const correlations: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  // For demonstration, using sector-based correlations
  const sectorCorrelations: { [key: string]: { [key: string]: number } } = {
    'tech': { 'tech': 1.0, 'finance': 0.3, 'healthcare': 0.2, 'energy': 0.1 },
    'finance': { 'tech': 0.3, 'finance': 1.0, 'healthcare': 0.15, 'energy': 0.25 },
    'healthcare': { 'tech': 0.2, 'finance': 0.15, 'healthcare': 1.0, 'energy': 0.1 },
    'energy': { 'tech': 0.1, 'finance': 0.25, 'healthcare': 0.1, 'energy': 1.0 }
  };

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) {
        correlations[i][j] = 1.0;
      } else {
        const sector1 = getSector(assets[i].ticker);
        const sector2 = getSector(assets[j].ticker);
        correlations[i][j] = sectorCorrelations[sector1]?.[sector2] || 0.3;
      }
    }
  }
  
  return correlations;
};

// Simple sector classification
const getSector = (ticker: string): string => {
  const techStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META'];
  const financeStocks = ['JPM', 'BAC', 'WFC', 'GS', 'MS'];
  const healthcareStocks = ['JNJ', 'PFE', 'UNH', 'ABBV'];
  const energyStocks = ['XOM', 'CVX', 'COP'];
  
  if (techStocks.includes(ticker)) return 'tech';
  if (financeStocks.includes(ticker)) return 'finance';
  if (healthcareStocks.includes(ticker)) return 'healthcare';
  if (energyStocks.includes(ticker)) return 'energy';
  
  return 'tech'; // default
};

// Portfolio Monte Carlo simulation
export const runPortfolioSimulation = async (params: PortfolioParams): Promise<PortfolioResults> => {
  const { assets, timeHorizon, numSimulations } = params;
  
  // Fetch current prices and calculate initial portfolio value
  const assetData = await Promise.all(
    assets.map(async (asset) => {
      const data = await fetchRealStockData(asset.ticker);
      return {
        ...asset,
        currentPrice: data.currentPrice,
        expectedReturn: data.expectedReturn,
        volatility: data.volatility
      };
    })
  );

  const initialValue = assetData.reduce((sum, asset) => sum + (asset.currentPrice! * asset.weight), 0);
  
  // Get correlation matrix
  const correlations = calculateCorrelationMatrix(assetData);
  
  // Generate portfolio paths
  const portfolioPaths: number[][] = [];
  const finalValues: number[] = [];
  const assetPaths: { [ticker: string]: number[][] } = {};
  
  // Initialize asset paths storage
  assetData.forEach(asset => {
    assetPaths[asset.ticker] = [];
  });
  
  for (let sim = 0; sim < numSimulations; sim++) {
    const portfolioPath: number[] = [initialValue];
    const currentAssetPaths: { [ticker: string]: number[] } = {};
    
    // Initialize asset paths for this simulation
    assetData.forEach(asset => {
      currentAssetPaths[asset.ticker] = [asset.currentPrice!];
    });
    
    // Generate correlated random walks for each asset
    for (let day = 1; day <= timeHorizon; day++) {
      let portfolioValue = 0;
      
      // Generate correlated random numbers
      const randomNumbers = generateCorrelatedRandoms(assetData.length, correlations);
      
      assetData.forEach((asset, index) => {
        const dt = 1 / 252; // Daily time step
        const drift = (asset.expectedReturn! - 0.5 * asset.volatility! ** 2) * dt;
        const diffusion = asset.volatility! * Math.sqrt(dt) * randomNumbers[index];
        
        const previousPrice = currentAssetPaths[asset.ticker][day - 1];
        const newPrice = previousPrice * Math.exp(drift + diffusion);
        
        currentAssetPaths[asset.ticker].push(newPrice);
        portfolioValue += newPrice * asset.weight;
      });
      
      portfolioPath.push(portfolioValue);
    }
    
    portfolioPaths.push(portfolioPath);
    finalValues.push(portfolioPath[portfolioPath.length - 1]);
    
    // Store asset paths
    assetData.forEach(asset => {
      assetPaths[asset.ticker].push(currentAssetPaths[asset.ticker]);
    });
  }
  
  // Calculate statistics
  const sortedFinalValues = [...finalValues].sort((a, b) => a - b);
  const averageEndingValue = finalValues.reduce((sum, val) => sum + val, 0) / finalValues.length;
  const returns = finalValues.map(val => (val - initialValue) / initialValue);
  const averageReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
  const returnStd = Math.sqrt(returns.reduce((sum, ret) => sum + (ret - averageReturn) ** 2, 0) / returns.length);
  
  const statistics = {
    averageEndingValue,
    probabilityOfGain: finalValues.filter(val => val > initialValue).length / finalValues.length,
    percentile5: sortedFinalValues[Math.floor(0.05 * finalValues.length)],
    percentile95: sortedFinalValues[Math.floor(0.95 * finalValues.length)],
    maxValue: Math.max(...finalValues),
    minValue: Math.min(...finalValues),
    expectedReturn: averageReturn * 252, // Annualized
    volatility: returnStd * Math.sqrt(252), // Annualized
    sharpeRatio: (averageReturn * 252) / (returnStd * Math.sqrt(252))
  };
  
  const riskMetrics = {
    var95: initialValue - sortedFinalValues[Math.floor(0.05 * finalValues.length)],
    var99: initialValue - sortedFinalValues[Math.floor(0.01 * finalValues.length)],
    expectedShortfall: initialValue - sortedFinalValues.slice(0, Math.floor(0.05 * finalValues.length))
      .reduce((sum, val) => sum + val, 0) / Math.floor(0.05 * finalValues.length),
    maxDrawdown: calculateMaxDrawdown(portfolioPaths)
  };
  
  return {
    paths: portfolioPaths,
    finalValues,
    initialValue,
    assetPaths,
    statistics,
    riskMetrics
  };
};

// Generate correlated random numbers using Cholesky decomposition
const generateCorrelatedRandoms = (n: number, correlationMatrix: number[][]): number[] => {
  const L = choleskyDecomposition(correlationMatrix);
  const uncorrelatedRandoms = Array.from({ length: n }, () => randomNormal());
  
  const correlatedRandoms = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      correlatedRandoms[i] += L[i][j] * uncorrelatedRandoms[j];
    }
  }
  
  return correlatedRandoms;
};

// Cholesky decomposition for correlation matrix
const choleskyDecomposition = (matrix: number[][]): number[][] => {
  const n = matrix.length;
  const L: number[][] = Array(n).fill(null).map(() => Array(n).fill(0));
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      if (i === j) {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L[j][k] ** 2;
        }
        L[i][j] = Math.sqrt(matrix[i][i] - sum);
      } else {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }
  
  return L;
};

// Random normal generator (Box-Muller)
const randomNormal = (): number => {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// Calculate maximum drawdown
const calculateMaxDrawdown = (paths: number[][]): number => {
  let maxDrawdown = 0;
  
  paths.forEach(path => {
    let peak = path[0];
    let maxDD = 0;
    
    path.forEach(value => {
      if (value > peak) peak = value;
      const drawdown = (peak - value) / peak;
      if (drawdown > maxDD) maxDD = drawdown;
    });
    
    if (maxDD > maxDrawdown) maxDrawdown = maxDD;
  });
  
  return maxDrawdown;
};

// Efficient frontier calculation
export const calculateEfficientFrontier = async (assets: Asset[], numPoints: number = 50): Promise<EfficientFrontierPoint[]> => {
  const points: EfficientFrontierPoint[] = [];
  
  // Calculate expected returns and covariance matrix
  const assetData = await Promise.all(
    assets.map(async (asset) => {
      const data = await fetchRealStockData(asset.ticker);
      return {
        ...asset,
        expectedReturn: data.expectedReturn,
        volatility: data.volatility
      };
    })
  );
  
  const correlations = calculateCorrelationMatrix(assetData);
  const n = assetData.length;
  
  // Generate points along the efficient frontier
  for (let i = 0; i <= numPoints; i++) {
    const targetReturn = 0.05 + (i / numPoints) * 0.25; // 5% to 30% target returns
    
    // Simple optimization: equal weights adjusted for target return
    const weights = optimizePortfolio(assetData, correlations, targetReturn);
    
    const portfolioReturn = weights.reduce((sum, weight, index) => 
      sum + weight * assetData[index].expectedReturn!, 0);
    
    const portfolioVolatility = calculatePortfolioVolatility(weights, assetData, correlations);
    
    points.push({
      expectedReturn: portfolioReturn,
      volatility: portfolioVolatility,
      sharpeRatio: portfolioReturn / portfolioVolatility,
      weights
    });
  }
  
  return points.sort((a, b) => a.volatility - b.volatility);
};

// Simple portfolio optimization
const optimizePortfolio = (assets: Asset[], correlations: number[][], targetReturn: number): number[] => {
  const n = assets.length;
  const weights = Array(n).fill(1 / n); // Start with equal weights
  
  // This is a simplified optimization - in practice you'd use proper quadratic programming
  return weights;
};

// Calculate portfolio volatility
const calculatePortfolioVolatility = (weights: number[], assets: Asset[], correlations: number[][]): number => {
  const n = weights.length;
  let variance = 0;
  
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      variance += weights[i] * weights[j] * assets[i].volatility! * assets[j].volatility! * correlations[i][j];
    }
  }
  
  return Math.sqrt(variance);
};

// Popular portfolio presets
export const getPortfolioPresets = (): { name: string; assets: Asset[] }[] => [
  {
    name: "S&P 500 Tech Giants",
    assets: [
      { ticker: "AAPL", name: "Apple", weight: 0.25 },
      { ticker: "MSFT", name: "Microsoft", weight: 0.25 },
      { ticker: "GOOGL", name: "Alphabet", weight: 0.25 },
      { ticker: "AMZN", name: "Amazon", weight: 0.25 }
    ]
  },
  {
    name: "Diversified Growth",
    assets: [
      { ticker: "AAPL", name: "Apple", weight: 0.2 },
      { ticker: "JPM", name: "JPMorgan", weight: 0.2 },
      { ticker: "JNJ", name: "Johnson & Johnson", weight: 0.2 },
      { ticker: "XOM", name: "Exxon Mobil", weight: 0.2 },
      { ticker: "TSLA", name: "Tesla", weight: 0.2 }
    ]
  },
  {
    name: "Conservative Value",
    assets: [
      { ticker: "JPM", name: "JPMorgan", weight: 0.3 },
      { ticker: "JNJ", name: "Johnson & Johnson", weight: 0.3 },
      { ticker: "WMT", name: "Walmart", weight: 0.2 },
      { ticker: "PG", name: "Procter & Gamble", weight: 0.2 }
    ]
  }
];