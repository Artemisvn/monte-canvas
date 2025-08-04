import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  PieChart,
  BarChart3,
  Shield
} from 'lucide-react';
import { PortfolioResults as PortfolioData, Asset } from '@/lib/portfolio';

interface PortfolioResultsProps {
  results: PortfolioData;
  assets: Asset[];
}

export const PortfolioResults: React.FC<PortfolioResultsProps> = ({ results, assets }) => {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const getRiskLevel = (sharpeRatio: number): { level: string; color: string; description: string } => {
    if (sharpeRatio > 1.5) return { level: "Excellent", color: "bg-success", description: "Very attractive risk-adjusted returns" };
    if (sharpeRatio > 1.0) return { level: "Good", color: "bg-primary", description: "Good risk-adjusted returns" };
    if (sharpeRatio > 0.5) return { level: "Moderate", color: "bg-warning", description: "Moderate risk-adjusted returns" };
    return { level: "Poor", color: "bg-destructive", description: "Poor risk-adjusted returns" };
  };

  const potentialGain = results.statistics.probabilityOfGain;
  const expectedReturn = results.statistics.expectedReturn;
  const riskLevel = getRiskLevel(results.statistics.sharpeRatio);

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Probability of Gain</p>
                <p className="text-2xl font-bold">{formatPercent(potentialGain)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Expected Return</p>
                <p className="text-2xl font-bold">{formatPercent(expectedReturn)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Value at Risk (95%)</p>
                <p className="text-2xl font-bold">{formatCurrency(results.riskMetrics.var95)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-accent" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Sharpe Ratio</p>
                <p className="text-2xl font-bold">{results.statistics.sharpeRatio.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Projections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Portfolio Projections
            </CardTitle>
            <CardDescription>Expected portfolio value outcomes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Initial Value</span>
                  <span className="text-sm">{formatCurrency(results.initialValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Average Ending Value</span>
                  <span className="text-sm font-bold">{formatCurrency(results.statistics.averageEndingValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Expected Gain/Loss</span>
                  <span className={`text-sm font-bold ${
                    results.statistics.averageEndingValue > results.initialValue ? 'text-success' : 'text-destructive'
                  }`}>
                    {formatCurrency(results.statistics.averageEndingValue - results.initialValue)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Best Case (95%)</span>
                  <span className="text-sm text-success">{formatCurrency(results.statistics.percentile95)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Worst Case (5%)</span>
                  <span className="text-sm text-destructive">{formatCurrency(results.statistics.percentile5)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Value Range</span>
                  <span className="text-sm">{formatCurrency(results.statistics.maxValue - results.statistics.minValue)}</span>
                </div>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Return Distribution</span>
                <Badge variant="outline">{results.finalValues.length} simulations</Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Loss</span>
                  <span>Gain</span>
                </div>
                <Progress 
                  value={potentialGain * 100} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPercent(1 - potentialGain)} chance of loss</span>
                  <span>{formatPercent(potentialGain)} chance of gain</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Risk Analysis
            </CardTitle>
            <CardDescription>Advanced risk metrics and assessment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Portfolio Volatility</p>
                  <p className="text-xs text-muted-foreground">Annualized standard deviation</p>
                </div>
                <Badge variant="outline">{formatPercent(results.statistics.volatility)}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Maximum Drawdown</p>
                  <p className="text-xs text-muted-foreground">Largest peak-to-trough decline</p>
                </div>
                <Badge variant="destructive">{formatPercent(results.riskMetrics.maxDrawdown)}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Expected Shortfall</p>
                  <p className="text-xs text-muted-foreground">Average loss in worst 5% cases</p>
                </div>
                <Badge variant="destructive">{formatCurrency(results.riskMetrics.expectedShortfall)}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Value at Risk (99%)</p>
                  <p className="text-xs text-muted-foreground">Maximum loss with 99% confidence</p>
                </div>
                <Badge variant="destructive">{formatCurrency(results.riskMetrics.var99)}</Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risk Assessment</span>
                <Badge className={riskLevel.color}>{riskLevel.level}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{riskLevel.description}</p>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Sharpe Ratio: {results.statistics.sharpeRatio.toFixed(2)} (higher is better)</p>
                <p>• Annual Return: {formatPercent(expectedReturn)}</p>
                <p>• Annual Volatility: {formatPercent(results.statistics.volatility)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Composition */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Portfolio Composition
          </CardTitle>
          <CardDescription>Current asset allocation and weights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {assets.map((asset, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{asset.ticker}</p>
                    <p className="text-xs text-muted-foreground truncate">{asset.name}</p>
                  </div>
                  <Badge variant="outline">{formatPercent(asset.weight)}</Badge>
                </div>
                <Progress value={asset.weight * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle>Simulation Interpretation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">
            Based on {results.finalValues.length} Monte Carlo simulations, your portfolio shows a{' '}
            <span className="font-semibold">{formatPercent(potentialGain)} probability of generating positive returns</span>{' '}
            over the simulation period.
          </p>
          
          <p className="text-sm leading-relaxed">
            The expected annualized return is{' '}
            <span className="font-semibold">{formatPercent(expectedReturn)}</span>{' '}
            with a volatility of{' '}
            <span className="font-semibold">{formatPercent(results.statistics.volatility)}</span>.
            The Sharpe ratio of{' '}
            <span className="font-semibold">{results.statistics.sharpeRatio.toFixed(2)}</span>{' '}
            indicates {riskLevel.level.toLowerCase()} risk-adjusted performance.
          </p>

          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> This simulation is based on historical data and mathematical models. 
              Past performance does not guarantee future results. Consider your risk tolerance and investment 
              objectives before making investment decisions.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};