import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { EfficientFrontierPoint, PortfolioResults } from '@/lib/portfolio';
import { Target, TrendingUp } from 'lucide-react';

interface EfficientFrontierChartProps {
  frontierPoints: EfficientFrontierPoint[];
  currentPortfolio?: PortfolioResults | null;
}

export const EfficientFrontierChart: React.FC<EfficientFrontierChartProps> = ({ 
  frontierPoints, 
  currentPortfolio 
}) => {
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  const chartData = frontierPoints.map((point, index) => ({
    volatility: point.volatility * 100,
    expectedReturn: point.expectedReturn * 100,
    sharpeRatio: point.sharpeRatio,
    index
  }));

  // Find optimal portfolios
  const maxSharpeIndex = frontierPoints.findIndex(point => 
    point.sharpeRatio === Math.max(...frontierPoints.map(p => p.sharpeRatio))
  );
  const minVolatilityIndex = frontierPoints.findIndex(point => 
    point.volatility === Math.min(...frontierPoints.map(p => p.volatility))
  );

  const currentPortfolioPoint = currentPortfolio ? {
    volatility: currentPortfolio.statistics.volatility * 100,
    expectedReturn: currentPortfolio.statistics.expectedReturn * 100,
    sharpeRatio: currentPortfolio.statistics.sharpeRatio
  } : null;

  return (
    <div className="space-y-6">
      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Efficient Frontier
          </CardTitle>
          <CardDescription>
            Risk-return optimization showing the best possible portfolios for each level of risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="volatility"
                  type="number"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Volatility (Annual)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  dataKey="expectedReturn"
                  type="number"
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(value) => `${value.toFixed(1)}%`}
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Expected Return (Annual)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'expectedReturn') return [`${value.toFixed(1)}%`, 'Expected Return'];
                    if (name === 'volatility') return [`${value.toFixed(1)}%`, 'Volatility'];
                    if (name === 'sharpeRatio') return [value.toFixed(2), 'Sharpe Ratio'];
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                
                {/* Efficient Frontier Line */}
                <Scatter
                  dataKey="expectedReturn"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.6}
                  strokeWidth={2}
                  stroke="hsl(var(--primary))"
                />

                {/* Optimal Portfolios */}
                {maxSharpeIndex >= 0 && (
                  <ReferenceDot
                    x={chartData[maxSharpeIndex].volatility}
                    y={chartData[maxSharpeIndex].expectedReturn}
                    r={8}
                    fill="hsl(var(--success))"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    label="Max Sharpe"
                  />
                )}
                
                {minVolatilityIndex >= 0 && (
                  <ReferenceDot
                    x={chartData[minVolatilityIndex].volatility}
                    y={chartData[minVolatilityIndex].expectedReturn}
                    r={8}
                    fill="hsl(var(--accent))"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    label="Min Vol"
                  />
                )}

                {/* Current Portfolio */}
                {currentPortfolioPoint && (
                  <ReferenceDot
                    x={currentPortfolioPoint.volatility}
                    y={currentPortfolioPoint.expectedReturn}
                    r={10}
                    fill="hsl(var(--destructive))"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={3}
                    label="Current"
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Optimal Portfolios Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Maximum Sharpe Ratio Portfolio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              Maximum Sharpe Ratio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {maxSharpeIndex >= 0 && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Expected Return</span>
                    <Badge variant="outline">{formatPercent(frontierPoints[maxSharpeIndex].expectedReturn)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Volatility</span>
                    <Badge variant="outline">{formatPercent(frontierPoints[maxSharpeIndex].volatility)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sharpe Ratio</span>
                    <Badge className="bg-success">{frontierPoints[maxSharpeIndex].sharpeRatio.toFixed(2)}</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Best risk-adjusted returns
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Minimum Volatility Portfolio */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-accent" />
              Minimum Volatility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {minVolatilityIndex >= 0 && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Expected Return</span>
                    <Badge variant="outline">{formatPercent(frontierPoints[minVolatilityIndex].expectedReturn)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Volatility</span>
                    <Badge className="bg-accent">{formatPercent(frontierPoints[minVolatilityIndex].volatility)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sharpe Ratio</span>
                    <Badge variant="outline">{frontierPoints[minVolatilityIndex].sharpeRatio.toFixed(2)}</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Lowest risk option
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Current Portfolio Comparison */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              Current Portfolio
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentPortfolioPoint ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Expected Return</span>
                    <Badge variant="outline">{formatPercent(currentPortfolioPoint.expectedReturn / 100)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Volatility</span>
                    <Badge variant="outline">{formatPercent(currentPortfolioPoint.volatility / 100)}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Sharpe Ratio</span>
                    <Badge variant="destructive">{currentPortfolioPoint.sharpeRatio.toFixed(2)}</Badge>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {currentPortfolioPoint.sharpeRatio > frontierPoints[maxSharpeIndex]?.sharpeRatio * 0.9 
                    ? "Near optimal performance" 
                    : "Room for improvement"}
                </div>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">
                Run a portfolio simulation to compare with efficient frontier
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle>Efficient Frontier Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">
            The efficient frontier shows the optimal risk-return combinations available with your selected assets. 
            Each point represents a portfolio that maximizes expected return for a given level of risk.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Key Insights:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Green dot: Maximum Sharpe ratio (best risk-adjusted returns)</li>
                <li>• Yellow dot: Minimum volatility (most conservative)</li>
                <li>• Red dot: Your current portfolio (if simulated)</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Optimization Tips:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Higher Sharpe ratios indicate better risk-adjusted returns</li>
                <li>• Consider your risk tolerance when choosing target volatility</li>
                <li>• Diversification can help improve the risk-return profile</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};