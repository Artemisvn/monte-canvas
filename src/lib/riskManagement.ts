// Risk Management and Portfolio Analytics Library

export interface RiskMetrics {
  var: number; // Value at Risk
  cvar: number; // Conditional Value at Risk
  maxDrawdown: number;
  volatility: number;
  sharpeRatio: number;
  sortino: number;
  calmar: number;
  beta: number;
  alpha: number;
  informationRatio: number;
  trackingError: number;
}

export interface PositionSizing {
  kellyPercentage: number;
  optimalF: number;
  fixedFractional: number;
  volatilityScaled: number;
}

export interface PortfolioOptimization {
  weights: number[];
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  diversificationRatio: number;
}

export class RiskManager {
  // Value at Risk calculation (parametric method)
  static calculateVaR(returns: number[], confidence: number = 0.05): number {
    const sortedReturns = [...returns].sort((a, b) => a - b);
    const index = Math.floor(returns.length * confidence);
    return Math.abs(sortedReturns[index] || 0);
  }

  // Conditional Value at Risk (Expected Shortfall)
  static calculateCVaR(returns: number[], confidence: number = 0.05): number {
    const var95 = this.calculateVaR(returns, confidence);
    const worstReturns = returns.filter(r => r <= -var95);
    return worstReturns.length > 0 ? Math.abs(worstReturns.reduce((a, b) => a + b, 0) / worstReturns.length) : 0;
  }

  // Maximum Drawdown calculation
  static calculateMaxDrawdown(returns: number[]): number {
    let peak = 0;
    let maxDD = 0;
    let cumulative = 1;

    for (const ret of returns) {
      cumulative *= (1 + ret);
      if (cumulative > peak) peak = cumulative;
      const drawdown = (peak - cumulative) / peak;
      if (drawdown > maxDD) maxDD = drawdown;
    }

    return maxDD;
  }

  // Volatility (annualized)
  static calculateVolatility(returns: number[], periods: number = 252): number {
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((acc, ret) => acc + Math.pow(ret - mean, 2), 0) / (returns.length - 1);
    return Math.sqrt(variance * periods);
  }

  // Sharpe Ratio
  static calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.02, periods: number = 252): number {
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length * periods;
    const volatility = this.calculateVolatility(returns, periods);
    return volatility > 0 ? (meanReturn - riskFreeRate) / volatility : 0;
  }

  // Sortino Ratio (downside deviation)
  static calculateSortino(returns: number[], targetReturn: number = 0, periods: number = 252): number {
    const meanReturn = returns.reduce((a, b) => a + b, 0) / returns.length * periods;
    const downsideReturns = returns.filter(r => r < targetReturn);
    if (downsideReturns.length === 0) return 0;
    
    const downsideDeviation = Math.sqrt(
      downsideReturns.reduce((acc, ret) => acc + Math.pow(ret - targetReturn, 2), 0) / downsideReturns.length * periods
    );
    
    return downsideDeviation > 0 ? (meanReturn - targetReturn) / downsideDeviation : 0;
  }

  // Calmar Ratio
  static calculateCalmar(returns: number[], periods: number = 252): number {
    const annualizedReturn = returns.reduce((a, b) => a + b, 0) / returns.length * periods;
    const maxDrawdown = this.calculateMaxDrawdown(returns);
    return maxDrawdown > 0 ? annualizedReturn / maxDrawdown : 0;
  }

  // Beta calculation against benchmark
  static calculateBeta(assetReturns: number[], benchmarkReturns: number[]): number {
    if (assetReturns.length !== benchmarkReturns.length) return 0;
    
    const assetMean = assetReturns.reduce((a, b) => a + b, 0) / assetReturns.length;
    const benchmarkMean = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length;
    
    let covariance = 0;
    let benchmarkVariance = 0;
    
    for (let i = 0; i < assetReturns.length; i++) {
      covariance += (assetReturns[i] - assetMean) * (benchmarkReturns[i] - benchmarkMean);
      benchmarkVariance += Math.pow(benchmarkReturns[i] - benchmarkMean, 2);
    }
    
    return benchmarkVariance > 0 ? covariance / benchmarkVariance : 0;
  }

  // Alpha calculation
  static calculateAlpha(assetReturns: number[], benchmarkReturns: number[], riskFreeRate: number = 0.02): number {
    const assetReturn = assetReturns.reduce((a, b) => a + b, 0) / assetReturns.length * 252;
    const benchmarkReturn = benchmarkReturns.reduce((a, b) => a + b, 0) / benchmarkReturns.length * 252;
    const beta = this.calculateBeta(assetReturns, benchmarkReturns);
    
    return assetReturn - (riskFreeRate + beta * (benchmarkReturn - riskFreeRate));
  }

  // Information Ratio
  static calculateInformationRatio(assetReturns: number[], benchmarkReturns: number[]): number {
    if (assetReturns.length !== benchmarkReturns.length) return 0;
    
    const excessReturns = assetReturns.map((ret, i) => ret - benchmarkReturns[i]);
    const meanExcess = excessReturns.reduce((a, b) => a + b, 0) / excessReturns.length * 252;
    const trackingError = this.calculateVolatility(excessReturns);
    
    return trackingError > 0 ? meanExcess / trackingError : 0;
  }

  // Tracking Error
  static calculateTrackingError(assetReturns: number[], benchmarkReturns: number[]): number {
    if (assetReturns.length !== benchmarkReturns.length) return 0;
    const excessReturns = assetReturns.map((ret, i) => ret - benchmarkReturns[i]);
    return this.calculateVolatility(excessReturns);
  }

  // Complete risk metrics calculation
  static calculateRiskMetrics(assetReturns: number[], benchmarkReturns?: number[]): RiskMetrics {
    const var95 = this.calculateVaR(assetReturns);
    const cvar = this.calculateCVaR(assetReturns);
    const maxDrawdown = this.calculateMaxDrawdown(assetReturns);
    const volatility = this.calculateVolatility(assetReturns);
    const sharpeRatio = this.calculateSharpeRatio(assetReturns);
    const sortino = this.calculateSortino(assetReturns);
    const calmar = this.calculateCalmar(assetReturns);
    
    let beta = 0;
    let alpha = 0;
    let informationRatio = 0;
    let trackingError = 0;
    
    if (benchmarkReturns && benchmarkReturns.length === assetReturns.length) {
      beta = this.calculateBeta(assetReturns, benchmarkReturns);
      alpha = this.calculateAlpha(assetReturns, benchmarkReturns);
      informationRatio = this.calculateInformationRatio(assetReturns, benchmarkReturns);
      trackingError = this.calculateTrackingError(assetReturns, benchmarkReturns);
    }
    
    return {
      var: var95,
      cvar,
      maxDrawdown,
      volatility,
      sharpeRatio,
      sortino,
      calmar,
      beta,
      alpha,
      informationRatio,
      trackingError
    };
  }
}

export class PositionSizer {
  // Kelly Criterion for optimal position sizing
  static kellyCalculation(winRate: number, avgWin: number, avgLoss: number): number {
    if (avgLoss <= 0) return 0;
    const winLossRatio = avgWin / Math.abs(avgLoss);
    return Math.max(0, Math.min(1, (winRate * winLossRatio - (1 - winRate)) / winLossRatio));
  }

  // Optimal F calculation
  static optimalF(returns: number[]): number {
    const losses = returns.filter(r => r < 0);
    if (losses.length === 0) return 0;
    
    const largestLoss = Math.min(...losses);
    let bestF = 0;
    let bestTWR = 0;
    
    for (let f = 0.01; f <= 1; f += 0.01) {
      let twr = 1;
      for (const ret of returns) {
        twr *= (1 + f * ret / Math.abs(largestLoss));
      }
      
      if (twr > bestTWR) {
        bestTWR = twr;
        bestF = f;
      }
    }
    
    return bestF;
  }

  // Fixed fractional position sizing
  static fixedFractional(accountValue: number, riskPerTrade: number, stopLoss: number): number {
    return stopLoss > 0 ? (accountValue * riskPerTrade) / stopLoss : 0;
  }

  // Volatility-scaled position sizing
  static volatilityScaled(baseSize: number, currentVol: number, targetVol: number): number {
    return currentVol > 0 ? baseSize * (targetVol / currentVol) : baseSize;
  }

  // Complete position sizing analysis
  static calculatePositionSizing(returns: number[], winRate: number, avgWin: number, avgLoss: number): PositionSizing {
    return {
      kellyPercentage: this.kellyCalculation(winRate, avgWin, avgLoss),
      optimalF: this.optimalF(returns),
      fixedFractional: 0.02, // 2% default risk per trade
      volatilityScaled: 1.0 // Base position size
    };
  }
}

export class PortfolioOptimizer {
  // Modern Portfolio Theory - Mean Variance Optimization
  static meanVarianceOptimization(
    expectedReturns: number[],
    covarianceMatrix: number[][],
    riskFreeRate: number = 0.02
  ): PortfolioOptimization {
    const n = expectedReturns.length;
    if (n === 0 || covarianceMatrix.length !== n) {
      return {
        weights: [],
        expectedReturn: 0,
        volatility: 0,
        sharpeRatio: 0,
        diversificationRatio: 0
      };
    }

    // Simplified equal weight as placeholder for complex optimization
    const weights = new Array(n).fill(1 / n);
    
    const expectedReturn = weights.reduce((sum, w, i) => sum + w * expectedReturns[i], 0);
    
    let variance = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        variance += weights[i] * weights[j] * covarianceMatrix[i][j];
      }
    }
    
    const volatility = Math.sqrt(variance);
    const sharpeRatio = volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;
    
    // Diversification ratio calculation
    const weightedAvgVol = weights.reduce((sum, w, i) => 
      sum + w * Math.sqrt(covarianceMatrix[i][i]), 0
    );
    const diversificationRatio = weightedAvgVol > 0 ? volatility / weightedAvgVol : 1;
    
    return {
      weights,
      expectedReturn,
      volatility,
      sharpeRatio,
      diversificationRatio
    };
  }

  // Risk Parity portfolio
  static riskParityWeights(covarianceMatrix: number[][]): number[] {
    const n = covarianceMatrix.length;
    if (n === 0) return [];
    
    // Simplified inverse volatility weighting
    const volatilities = covarianceMatrix.map((row, i) => Math.sqrt(row[i]));
    const invVols = volatilities.map(vol => vol > 0 ? 1 / vol : 0);
    const sumInvVols = invVols.reduce((a, b) => a + b, 0);
    
    return sumInvVols > 0 ? invVols.map(inv => inv / sumInvVols) : new Array(n).fill(1 / n);
  }

  // Minimum variance portfolio
  static minimumVarianceWeights(covarianceMatrix: number[][]): number[] {
    const n = covarianceMatrix.length;
    if (n === 0) return [];
    
    // Simplified calculation - in practice would use quadratic programming
    const invCovDiag = covarianceMatrix.map((row, i) => row[i] > 0 ? 1 / row[i] : 0);
    const sumInvCov = invCovDiag.reduce((a, b) => a + b, 0);
    
    return sumInvCov > 0 ? invCovDiag.map(inv => inv / sumInvCov) : new Array(n).fill(1 / n);
  }
}

// Portfolio stress testing
export class StressTester {
  // Monte Carlo simulation for portfolio stress testing
  static monteCarloStressTest(
    portfolio: { weights: number[]; assets: string[] },
    returns: number[][],
    numSimulations: number = 1000,
    timeHorizon: number = 252
  ): {
    scenarios: number[][];
    percentiles: { p5: number; p25: number; p50: number; p75: number; p95: number };
    maxLoss: number;
    avgReturn: number;
  } {
    const scenarios: number[][] = [];
    
    for (let sim = 0; sim < numSimulations; sim++) {
      const scenario: number[] = [];
      let portfolioValue = 1;
      
      for (let day = 0; day < timeHorizon; day++) {
        let dailyReturn = 0;
        
        for (let asset = 0; asset < portfolio.weights.length; asset++) {
          const randomIndex = Math.floor(Math.random() * returns[asset].length);
          dailyReturn += portfolio.weights[asset] * returns[asset][randomIndex];
        }
        
        portfolioValue *= (1 + dailyReturn);
        scenario.push(portfolioValue - 1); // Return relative to initial value
      }
      
      scenarios.push(scenario);
    }
    
    // Calculate percentiles from final values
    const finalReturns = scenarios.map(scenario => scenario[scenario.length - 1]).sort((a, b) => a - b);
    
    return {
      scenarios,
      percentiles: {
        p5: finalReturns[Math.floor(finalReturns.length * 0.05)],
        p25: finalReturns[Math.floor(finalReturns.length * 0.25)],
        p50: finalReturns[Math.floor(finalReturns.length * 0.50)],
        p75: finalReturns[Math.floor(finalReturns.length * 0.75)],
        p95: finalReturns[Math.floor(finalReturns.length * 0.95)]
      },
      maxLoss: Math.min(...finalReturns),
      avgReturn: finalReturns.reduce((a, b) => a + b, 0) / finalReturns.length
    };
  }

  // Historical scenario analysis
  static historicalScenarios(
    portfolio: { weights: number[]; assets: string[] },
    returns: number[][],
    stressEvents: { name: string; startDate: number; endDate: number }[]
  ) {
    return stressEvents.map(event => {
      let portfolioReturn = 0;
      
      for (let day = event.startDate; day <= Math.min(event.endDate, returns[0].length - 1); day++) {
        let dailyReturn = 0;
        for (let asset = 0; asset < portfolio.weights.length; asset++) {
          dailyReturn += portfolio.weights[asset] * returns[asset][day];
        }
        portfolioReturn += dailyReturn;
      }
      
      return {
        event: event.name,
        portfolioReturn,
        duration: event.endDate - event.startDate + 1
      };
    });
  }
}