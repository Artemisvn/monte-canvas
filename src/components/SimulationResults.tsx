import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  BarChart3, 
  Percent,
  DollarSign,
  AlertTriangle
} from 'lucide-react';
import { calculateRiskMetrics } from '@/lib/monteCarlo';

interface SimulationData {
  paths: number[][];
  finalPrices: number[];
  currentPrice: number;
  statistics: {
    averageEndingPrice: number;
    probabilityOfGain: number;
    percentile5: number;
    percentile95: number;
    maxPrice: number;
    minPrice: number;
  };
}

interface SimulationResultsProps {
  simulationData: SimulationData;
  ticker: string;
}

export const SimulationResults: React.FC<SimulationResultsProps> = ({ simulationData, ticker }) => {
  const { statistics, finalPrices, currentPrice } = simulationData;
  const riskMetrics = calculateRiskMetrics(finalPrices, currentPrice);
  
  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;
  
  const potentialGain = ((statistics.averageEndingPrice - currentPrice) / currentPrice) * 100;
  const confidenceInterval = statistics.percentile95 - statistics.percentile5;
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-success/10 to-success/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-success">Probability of Gain</p>
                <p className="text-2xl font-bold text-success">
                  {formatPercentage(statistics.probabilityOfGain)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Expected Return</p>
                <p className="text-2xl font-bold text-primary">
                  {potentialGain > 0 ? '+' : ''}{potentialGain.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-warning/10 to-warning/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-warning">Value at Risk (5%)</p>
                <p className="text-2xl font-bold text-warning">
                  {formatPrice(riskMetrics.valueAtRisk)}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/10 to-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-accent-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold text-accent-foreground">
                  {riskMetrics.sharpeRatio.toFixed(2)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-accent-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Price Statistics */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Price Projections
            </CardTitle>
            <CardDescription>
              Statistical analysis of final prices after simulation period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current Price</span>
                <Badge variant="outline">{formatPrice(currentPrice)}</Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Ending Price</span>
                <Badge variant={potentialGain > 0 ? "default" : "destructive"}>
                  {formatPrice(statistics.averageEndingPrice)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>5th Percentile (Worst Case)</span>
                  <span className="text-destructive">{formatPrice(statistics.percentile5)}</span>
                </div>
                <Progress 
                  value={((statistics.percentile5 - statistics.minPrice) / (statistics.maxPrice - statistics.minPrice)) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>95th Percentile (Best Case)</span>
                  <span className="text-success">{formatPrice(statistics.percentile95)}</span>
                </div>
                <Progress 
                  value={((statistics.percentile95 - statistics.minPrice) / (statistics.maxPrice - statistics.minPrice)) * 100} 
                  className="h-2"
                />
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Price Range</span>
                  <span className="text-sm text-muted-foreground">
                    {formatPrice(statistics.minPrice)} - {formatPrice(statistics.maxPrice)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Analysis
            </CardTitle>
            <CardDescription>
              Advanced risk metrics and portfolio analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Value at Risk (5%)</span>
                <Badge variant="destructive">
                  {formatPrice(riskMetrics.valueAtRisk)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expected Shortfall</span>
                <Badge variant="destructive">
                  {formatPercentage(riskMetrics.expectedShortfall)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Maximum Drawdown</span>
                <Badge variant="destructive">
                  {formatPercentage(riskMetrics.maxDrawdown)}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Sharpe Ratio</span>
                <Badge variant={riskMetrics.sharpeRatio > 1 ? "default" : "secondary"}>
                  {riskMetrics.sharpeRatio.toFixed(2)}
                </Badge>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Risk-Adjusted Performance</span>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-xs text-muted-foreground">
                  {riskMetrics.sharpeRatio > 1.5 ? "Excellent" : 
                   riskMetrics.sharpeRatio > 1 ? "Good" : 
                   riskMetrics.sharpeRatio > 0.5 ? "Fair" : "Poor"} risk-adjusted returns
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interpretation */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
        <CardHeader>
          <CardTitle>Simulation Interpretation</CardTitle>
          <CardDescription>
            Key insights from your Monte Carlo analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Probability Analysis:</strong> There is a {formatPercentage(statistics.probabilityOfGain)} chance 
              that {ticker} will be trading above its current price of {formatPrice(currentPrice)} at the end of the simulation period.
            </p>
            
            <p>
              <strong>Expected Outcome:</strong> On average, the stock is projected to reach {formatPrice(statistics.averageEndingPrice)}, 
              representing a {potentialGain > 0 ? 'gain' : 'loss'} of {Math.abs(potentialGain).toFixed(1)}%.
            </p>
            
            <p>
              <strong>Risk Assessment:</strong> In the worst 5% of scenarios, you could lose up to {formatPrice(riskMetrics.valueAtRisk)}. 
              The Sharpe ratio of {riskMetrics.sharpeRatio.toFixed(2)} indicates {
                riskMetrics.sharpeRatio > 1 ? 'favorable' : 'suboptimal'
              } risk-adjusted returns.
            </p>
            
            <p className="text-xs text-muted-foreground pt-2 border-t">
              <strong>Disclaimer:</strong> This simulation is for educational purposes only and should not be considered as investment advice. 
              Past performance and simulated results do not guarantee future returns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};