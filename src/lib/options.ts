// Options Pricing and Greeks Calculation Library

export interface OptionParameters {
  spot: number;          // Current stock price
  strike: number;        // Strike price
  timeToExpiry: number;  // Time to expiry in years
  riskFreeRate: number;  // Risk-free rate
  volatility: number;    // Implied volatility
  dividendYield?: number; // Dividend yield (default 0)
}

export interface GreeksResult {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  rho: number;
}

export interface OptionPrice {
  call: number;
  put: number;
}

export interface OptionStrategy {
  id: string;
  name: string;
  description: string;
  legs: OptionLeg[];
  maxProfit: number | null;
  maxLoss: number | null;
  breakevens: number[];
  type: 'bullish' | 'bearish' | 'neutral' | 'volatile';
}

export interface OptionLeg {
  type: 'call' | 'put';
  action: 'buy' | 'sell';
  strike: number;
  quantity: number;
  premium: number;
}

export class OptionsCalculator {
  // Standard normal cumulative distribution function
  private static normCDF(x: number): number {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x) / Math.sqrt(2.0);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return 0.5 * (1.0 + sign * y);
  }

  // Standard normal probability density function
  private static normPDF(x: number): number {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  // Black-Scholes option pricing
  static blackScholes(params: OptionParameters): OptionPrice {
    const { spot, strike, timeToExpiry, riskFreeRate, volatility, dividendYield = 0 } = params;

    if (timeToExpiry <= 0) {
      const intrinsicCall = Math.max(spot - strike, 0);
      const intrinsicPut = Math.max(strike - spot, 0);
      return { call: intrinsicCall, put: intrinsicPut };
    }

    const d1 = (Math.log(spot / strike) + (riskFreeRate - dividendYield + 0.5 * volatility * volatility) * timeToExpiry) / 
               (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    const nd1 = this.normCDF(d1);
    const nd2 = this.normCDF(d2);
    const nMinusd1 = this.normCDF(-d1);
    const nMinusd2 = this.normCDF(-d2);

    const callPrice = spot * Math.exp(-dividendYield * timeToExpiry) * nd1 - 
                     strike * Math.exp(-riskFreeRate * timeToExpiry) * nd2;
    
    const putPrice = strike * Math.exp(-riskFreeRate * timeToExpiry) * nMinusd2 - 
                    spot * Math.exp(-dividendYield * timeToExpiry) * nMinusd1;

    return { call: Math.max(callPrice, 0), put: Math.max(putPrice, 0) };
  }

  // Calculate Greeks
  static calculateGreeks(params: OptionParameters, optionType: 'call' | 'put'): GreeksResult {
    const { spot, strike, timeToExpiry, riskFreeRate, volatility, dividendYield = 0 } = params;

    if (timeToExpiry <= 0) {
      return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
    }

    const d1 = (Math.log(spot / strike) + (riskFreeRate - dividendYield + 0.5 * volatility * volatility) * timeToExpiry) / 
               (volatility * Math.sqrt(timeToExpiry));
    const d2 = d1 - volatility * Math.sqrt(timeToExpiry);

    const nd1 = this.normCDF(d1);
    const nMinusd1 = this.normCDF(-d1);
    const nd2 = this.normCDF(d2);
    const nMinusd2 = this.normCDF(-d2);
    const pdf1 = this.normPDF(d1);

    // Delta
    let delta: number;
    if (optionType === 'call') {
      delta = Math.exp(-dividendYield * timeToExpiry) * nd1;
    } else {
      delta = -Math.exp(-dividendYield * timeToExpiry) * nMinusd1;
    }

    // Gamma (same for calls and puts)
    const gamma = Math.exp(-dividendYield * timeToExpiry) * pdf1 / (spot * volatility * Math.sqrt(timeToExpiry));

    // Theta
    let theta: number;
    const term1 = -spot * pdf1 * volatility * Math.exp(-dividendYield * timeToExpiry) / (2 * Math.sqrt(timeToExpiry));
    const term2 = riskFreeRate * strike * Math.exp(-riskFreeRate * timeToExpiry);
    const term3 = dividendYield * spot * Math.exp(-dividendYield * timeToExpiry);

    if (optionType === 'call') {
      theta = term1 - term2 * nd2 + term3 * nd1;
    } else {
      theta = term1 + term2 * nMinusd2 - term3 * nMinusd1;
    }
    theta = theta / 365; // Convert to daily theta

    // Vega (same for calls and puts)
    const vega = spot * Math.exp(-dividendYield * timeToExpiry) * pdf1 * Math.sqrt(timeToExpiry) / 100;

    // Rho
    let rho: number;
    if (optionType === 'call') {
      rho = strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * nd2 / 100;
    } else {
      rho = -strike * timeToExpiry * Math.exp(-riskFreeRate * timeToExpiry) * nMinusd2 / 100;
    }

    return { delta, gamma, theta, vega, rho };
  }

  // Implied Volatility calculation using Newton-Raphson method
  static impliedVolatility(
    marketPrice: number,
    params: Omit<OptionParameters, 'volatility'>,
    optionType: 'call' | 'put'
  ): number {
    let vol = 0.2; // Initial guess
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const fullParams = { ...params, volatility: vol };
      const price = this.blackScholes(fullParams);
      const currentPrice = optionType === 'call' ? price.call : price.put;
      
      const priceDiff = currentPrice - marketPrice;
      
      if (Math.abs(priceDiff) < tolerance) {
        return vol;
      }

      const greeks = this.calculateGreeks(fullParams, optionType);
      const vega = greeks.vega * 100; // Convert back to decimal
      
      if (vega === 0) break;
      
      vol = vol - priceDiff / vega;
      
      // Keep volatility positive and reasonable
      vol = Math.max(0.001, Math.min(vol, 5.0));
    }

    return vol;
  }

  // Generate volatility surface
  static generateVolatilitySurface(
    spot: number,
    riskFreeRate: number,
    strikes: number[],
    expiries: number[]
  ): { strike: number; expiry: number; impliedVol: number }[] {
    const surface: { strike: number; expiry: number; impliedVol: number }[] = [];
    
    strikes.forEach(strike => {
      expiries.forEach(expiry => {
        // Generate realistic implied volatility based on moneyness and time
        const moneyness = strike / spot;
        const atmVol = 0.2; // Base ATM volatility
        
        // Volatility smile/skew effects
        const skew = Math.abs(moneyness - 1) * 0.1; // OTM options have higher vol
        const termStructure = Math.sqrt(expiry) * 0.05; // Vol increases with time
        
        const impliedVol = atmVol + skew + termStructure + (Math.random() - 0.5) * 0.02;
        
        surface.push({
          strike,
          expiry,
          impliedVol: Math.max(0.05, impliedVol) // Minimum 5% vol
        });
      });
    });
    
    return surface;
  }
}

export class OptionsStrategyBuilder {
  // Predefined option strategies
  static getStrategies(): OptionStrategy[] {
    return [
      {
        id: 'long-call',
        name: 'Long Call',
        description: 'Bullish strategy with unlimited upside potential',
        legs: [],
        maxProfit: null,
        maxLoss: 0,
        breakevens: [],
        type: 'bullish'
      },
      {
        id: 'long-put',
        name: 'Long Put',
        description: 'Bearish strategy with limited risk',
        legs: [],
        maxProfit: null,
        maxLoss: 0,
        breakevens: [],
        type: 'bearish'
      },
      {
        id: 'covered-call',
        name: 'Covered Call',
        description: 'Generate income from stock holdings',
        legs: [],
        maxProfit: 0,
        maxLoss: null,
        breakevens: [],
        type: 'neutral'
      },
      {
        id: 'bull-call-spread',
        name: 'Bull Call Spread',
        description: 'Limited risk, limited reward bullish strategy',
        legs: [],
        maxProfit: 0,
        maxLoss: 0,
        breakevens: [],
        type: 'bullish'
      },
      {
        id: 'iron-condor',
        name: 'Iron Condor',
        description: 'Neutral strategy profiting from low volatility',
        legs: [],
        maxProfit: 0,
        maxLoss: 0,
        breakevens: [],
        type: 'neutral'
      },
      {
        id: 'long-straddle',
        name: 'Long Straddle',
        description: 'Profit from high volatility in either direction',
        legs: [],
        maxProfit: null,
        maxLoss: 0,
        breakevens: [],
        type: 'volatile'
      }
    ];
  }

  // Calculate strategy payoff at expiration
  static calculatePayoff(strategy: OptionStrategy, spotPrices: number[]): { spot: number; payoff: number }[] {
    return spotPrices.map(spot => {
      let totalPayoff = 0;
      
      strategy.legs.forEach(leg => {
        let legPayoff = 0;
        
        if (leg.type === 'call') {
          const intrinsic = Math.max(spot - leg.strike, 0);
          legPayoff = leg.action === 'buy' ? intrinsic - leg.premium : leg.premium - intrinsic;
        } else {
          const intrinsic = Math.max(leg.strike - spot, 0);
          legPayoff = leg.action === 'buy' ? intrinsic - leg.premium : leg.premium - intrinsic;
        }
        
        totalPayoff += legPayoff * leg.quantity;
      });
      
      return { spot, payoff: totalPayoff };
    });
  }

  // Calculate strategy Greeks
  static calculateStrategyGreeks(strategy: OptionStrategy, params: OptionParameters): GreeksResult {
    let totalDelta = 0;
    let totalGamma = 0;
    let totalTheta = 0;
    let totalVega = 0;
    let totalRho = 0;

    strategy.legs.forEach(leg => {
      const legParams = { ...params, strike: leg.strike };
      const greeks = OptionsCalculator.calculateGreeks(legParams, leg.type);
      const multiplier = leg.action === 'buy' ? 1 : -1;
      
      totalDelta += greeks.delta * multiplier * leg.quantity;
      totalGamma += greeks.gamma * multiplier * leg.quantity;
      totalTheta += greeks.theta * multiplier * leg.quantity;
      totalVega += greeks.vega * multiplier * leg.quantity;
      totalRho += greeks.rho * multiplier * leg.quantity;
    });

    return {
      delta: totalDelta,
      gamma: totalGamma,
      theta: totalTheta,
      vega: totalVega,
      rho: totalRho
    };
  }
}
