import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { BacktestResult } from '@/lib/backtesting';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  AlertTriangle,
  BarChart3,
  Calculator,
  Activity
} from 'lucide-react';

interface BacktestResultsProps {
  result: BacktestResult;
  initialCapital: number;
}

export const BacktestResults: React.FC<BacktestResultsProps> = ({ result, initialCapital }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  const getRiskLevel = (sharpeRatio: number): { level: string; color: string; description: string } => {
    if (sharpeRatio > 2.0) return { level: "Excellent", color: "bg-success", description: "Outstanding risk-adjusted returns" };
    if (sharpeRatio > 1.0) return { level: "Good", color: "bg-primary", description: "Strong risk-adjusted returns" };
    if (sharpeRatio > 0.5) return { level: "Fair", color: "bg-warning", description: "Acceptable risk-adjusted returns" };
    if (sharpeRatio > 0) return { level: "Poor", color: "bg-destructive", description: "Below-average risk-adjusted returns" };
    return { level: "Very Poor", color: "bg-destructive", description: "Negative risk-adjusted returns" };
  };

  const getDrawdownLevel = (maxDrawdown: number): { level: string; color: string } => {
    if (maxDrawdown < 0.05) return { level: "Very Low", color: "bg-success" };
    if (maxDrawdown < 0.10) return { level: "Low", color: "bg-primary" };
    if (maxDrawdown < 0.20) return { level: "Moderate", color: "bg-warning" };
    if (maxDrawdown < 0.30) return { level: "High", color: "bg-destructive" };
    return { level: "Very High", color: "bg-destructive" };
  };

  const finalValue = result.portfolioValues[result.portfolioValues.length - 1]?.value || initialCapital;
  const totalPnL = finalValue - initialCapital;
  const riskAssessment = getRiskLevel(result.performance.sharpeRatio);
  const drawdownAssessment = getDrawdownLevel(result.performance.maxDrawdown);

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              {totalPnL >= 0 ? (
                <TrendingUp className="h-5 w-5 text-success" />
              ) : (
                <TrendingDown className="h-5 w-5 text-destructive" />
              )}
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total P&L</p>
                <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(totalPnL)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-primary" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Return</p>
                <p className={`text-2xl font-bold ${result.performance.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatPercent(result.performance.totalReturn)}
                </p>
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
                <p className="text-2xl font-bold">{result.performance.sharpeRatio.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Max Drawdown</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatPercent(result.performance.maxDrawdown)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk & Return Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Risk & Return Analysis
            </CardTitle>
            <CardDescription>Comprehensive performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Annualized Return</span>
                    <span className={`font-bold ${result.performance.annualizedReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {formatPercent(result.performance.annualizedReturn)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Volatility</span>
                    <span className="font-medium">{formatPercent(result.performance.volatility)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Sortino Ratio</span>
                    <span className="font-medium">{result.performance.sortinoRatio.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Calmar Ratio</span>
                    <span className="font-medium">{result.performance.calmarRatio.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Best Trade</span>
                    <span className="font-medium text-success">{formatCurrency(result.performance.bestTrade)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Worst Trade</span>
                    <span className="font-medium text-destructive">{formatCurrency(result.performance.worstTrade)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg Trade</span>
                    <span className="font-medium">{formatCurrency(result.performance.avgTrade)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Profit Factor</span>
                    <span className="font-medium">{result.performance.profitFactor.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            
            {/* Risk Assessment */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risk Assessment</span>
                <Badge className={riskAssessment.color}>{riskAssessment.level}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{riskAssessment.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Drawdown Risk</span>
                <Badge className={drawdownAssessment.color}>{drawdownAssessment.level}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trading Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Trading Statistics
            </CardTitle>
            <CardDescription>Trade execution and win rate analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Total Trades</p>
                  <p className="text-xs text-muted-foreground">Number of completed trades</p>
                </div>
                <Badge variant="outline">{result.performance.totalTrades}</Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Win Rate</p>
                  <p className="text-xs text-muted-foreground">Percentage of profitable trades</p>
                </div>
                <Badge className={result.performance.winRate > 0.5 ? "bg-success" : "bg-warning"}>
                  {formatPercent(result.performance.winRate)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Winning Trades</span>
                  <span>Losing Trades</span>
                </div>
                <Progress 
                  value={result.performance.winRate * 100} 
                  className="h-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatPercent(result.performance.winRate)}</span>
                  <span>{formatPercent(1 - result.performance.winRate)}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-2 border rounded text-center">
                  <p className="text-xs text-muted-foreground">Avg Winning Trade</p>
                  <p className="text-sm font-bold text-success">
                    {formatCurrency(result.performance.avgWinningTrade)}
                  </p>
                </div>
                <div className="p-2 border rounded text-center">
                  <p className="text-xs text-muted-foreground">Avg Losing Trade</p>
                  <p className="text-sm font-bold text-destructive">
                    {formatCurrency(result.performance.avgLosingTrade)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Portfolio Summary
          </CardTitle>
          <CardDescription>Complete backtest performance overview</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Capital Allocation</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Initial Capital</span>
                  <span className="font-medium">{formatCurrency(initialCapital)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Final Value</span>
                  <span className={`font-bold ${finalValue >= initialCapital ? 'text-success' : 'text-destructive'}`}>
                    {formatCurrency(finalValue)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Net P&L</span>
                  <span className={`font-bold ${totalPnL >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Risk Metrics</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Sharpe Ratio</span>
                  <span className="font-medium">{result.performance.sharpeRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sortino Ratio</span>
                  <span className="font-medium">{result.performance.sortinoRatio.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maximum Drawdown</span>
                  <span className="font-medium text-destructive">{formatPercent(result.performance.maxDrawdown)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Strategy Performance</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Signals</span>
                  <span className="font-medium">{result.signals.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Executed Trades</span>
                  <span className="font-medium">{result.performance.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span>Signal Efficiency</span>
                  <span className="font-medium">
                    {result.signals.length > 0 ? `${((result.performance.totalTrades / result.signals.length) * 100).toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Strategy Interpretation</h4>
            <p className="text-sm leading-relaxed">
              The backtest completed with a total return of{' '}
              <span className={`font-semibold ${result.performance.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                {formatPercent(result.performance.totalReturn)}
              </span>{' '}
              over {result.portfolioValues.length} trading days. The strategy executed{' '}
              <span className="font-semibold">{result.performance.totalTrades} trades</span>{' '}
              with a win rate of{' '}
              <span className="font-semibold">{formatPercent(result.performance.winRate)}</span>.
            </p>
            
            <p className="text-sm leading-relaxed">
              The Sharpe ratio of{' '}
              <span className="font-semibold">{result.performance.sharpeRatio.toFixed(2)}</span>{' '}
              indicates {riskAssessment.level.toLowerCase()} risk-adjusted performance. 
              The maximum drawdown of{' '}
              <span className="font-semibold text-destructive">{formatPercent(result.performance.maxDrawdown)}</span>{' '}
              represents the largest peak-to-trough decline during the backtest period.
            </p>

            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Disclaimer:</strong> Past performance does not guarantee future results. 
                This backtest is based on historical data and does not account for changing market conditions, 
                slippage variations, or execution difficulties that may occur in live trading.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};