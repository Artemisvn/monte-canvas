import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  RiskManager, 
  PositionSizer, 
  PortfolioOptimizer, 
  StressTester,
  RiskMetrics,
  PositionSizing,
  PortfolioOptimization
} from '@/lib/riskManagement';
import { 
  Shield, 
  TrendingDown, 
  AlertTriangle, 
  PieChart as PieChartIcon,
  BarChart3,
  Target,
  Zap
} from 'lucide-react';

export const RiskDashboard: React.FC = () => {
  const [portfolioData, setPortfolioData] = useState<{
    returns: number[];
    benchmarkReturns: number[];
    assets: string[];
    weights: number[];
  }>({
    returns: [],
    benchmarkReturns: [],
    assets: ['AAPL', 'GOOGL', 'MSFT', 'TSLA'],
    weights: [0.25, 0.25, 0.25, 0.25]
  });
  
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics | null>(null);
  const [positionSizing, setPositionSizing] = useState<PositionSizing | null>(null);
  const [portfolioOptimization, setPortfolioOptimization] = useState<PortfolioOptimization | null>(null);
  const [stressTestResults, setStressTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Generate sample data for demonstration
  useEffect(() => {
    generateSampleData();
  }, []);

  const generateSampleData = () => {
    setIsLoading(true);
    
    // Generate random returns for demonstration
    const returns = Array.from({ length: 252 }, () => (Math.random() - 0.5) * 0.04);
    const benchmarkReturns = Array.from({ length: 252 }, () => (Math.random() - 0.5) * 0.03);
    
    setPortfolioData(prev => ({
      ...prev,
      returns,
      benchmarkReturns
    }));

    // Calculate risk metrics
    const metrics = RiskManager.calculateRiskMetrics(returns, benchmarkReturns);
    setRiskMetrics(metrics);

    // Calculate position sizing
    const winRate = 0.55;
    const avgWin = 0.02;
    const avgLoss = -0.015;
    const sizing = PositionSizer.calculatePositionSizing(returns, winRate, avgWin, avgLoss);
    setPositionSizing(sizing);

    // Generate sample covariance matrix and expected returns
    const expectedReturns = [0.08, 0.12, 0.10, 0.15];
    const covarianceMatrix = [
      [0.04, 0.02, 0.015, 0.01],
      [0.02, 0.06, 0.02, 0.015],
      [0.015, 0.02, 0.05, 0.01],
      [0.01, 0.015, 0.01, 0.08]
    ];
    
    const optimization = PortfolioOptimizer.meanVarianceOptimization(expectedReturns, covarianceMatrix);
    setPortfolioOptimization(optimization);

    // Stress testing
    const portfolio = { weights: portfolioData.weights, assets: portfolioData.assets };
    const assetReturns = portfolioData.assets.map(() => returns);
    const stressResults = StressTester.monteCarloStressTest(portfolio, assetReturns, 1000, 252);
    setStressTestResults(stressResults);

    setIsLoading(false);
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;
  const formatNumber = (value: number) => value.toFixed(4);

  const getRiskColor = (value: number, thresholds: { low: number; high: number }) => {
    if (value <= thresholds.low) return 'text-success';
    if (value >= thresholds.high) return 'text-destructive';
    return 'text-warning';
  };

  const pieData = portfolioData.assets.map((asset, i) => ({
    name: asset,
    value: portfolioData.weights[i] * 100,
    fill: `hsl(${i * 90}, 70%, 50%)`
  }));

  const stressScenarioData = stressTestResults?.scenarios.slice(0, 10).map((scenario, i) => 
    scenario.map((value, day) => ({
      day,
      scenario: i,
      return: value * 100
    }))
  ).flat() || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Management Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive risk analysis and portfolio optimization tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label>Portfolio Assets (comma-separated)</Label>
              <Input
                value={portfolioData.assets.join(', ')}
                onChange={(e) => setPortfolioData(prev => ({
                  ...prev,
                  assets: e.target.value.split(',').map(s => s.trim())
                }))}
                placeholder="AAPL, GOOGL, MSFT, TSLA"
              />
            </div>
            <Button onClick={generateSampleData} disabled={isLoading}>
              {isLoading ? 'Calculating...' : 'Analyze Portfolio'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="risk-metrics" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="risk-metrics">Risk Metrics</TabsTrigger>
          <TabsTrigger value="position-sizing">Position Sizing</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="stress-testing">Stress Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="risk-metrics" className="space-y-4">
          {riskMetrics && (
            <>
              {/* Risk Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Value at Risk (95%)
                      </p>
                      <p className={`text-lg font-bold ${getRiskColor(riskMetrics.var, { low: 0.02, high: 0.05 })}`}>
                        {formatPercent(riskMetrics.var)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Conditional VaR</p>
                      <p className={`text-lg font-bold ${getRiskColor(riskMetrics.cvar, { low: 0.03, high: 0.07 })}`}>
                        {formatPercent(riskMetrics.cvar)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Max Drawdown</p>
                      <p className={`text-lg font-bold ${getRiskColor(riskMetrics.maxDrawdown, { low: 0.1, high: 0.3 })}`}>
                        {formatPercent(riskMetrics.maxDrawdown)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Volatility</p>
                      <p className={`text-lg font-bold ${getRiskColor(riskMetrics.volatility, { low: 0.15, high: 0.4 })}`}>
                        {formatPercent(riskMetrics.volatility)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                      <p className={`text-lg font-bold ${riskMetrics.sharpeRatio > 1 ? 'text-success' : riskMetrics.sharpeRatio > 0.5 ? 'text-warning' : 'text-destructive'}`}>
                        {formatNumber(riskMetrics.sharpeRatio)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Sortino Ratio</p>
                      <p className="text-lg font-bold">
                        {formatNumber(riskMetrics.sortino)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Beta</p>
                      <p className="text-lg font-bold">
                        {formatNumber(riskMetrics.beta)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Alpha</p>
                      <p className={`text-lg font-bold ${riskMetrics.alpha > 0 ? 'text-success' : 'text-destructive'}`}>
                        {formatPercent(riskMetrics.alpha)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Risk Metrics Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Risk Profile Visualization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { metric: 'VaR', value: riskMetrics.var * 100 },
                        { metric: 'CVaR', value: riskMetrics.cvar * 100 },
                        { metric: 'Max DD', value: riskMetrics.maxDrawdown * 100 },
                        { metric: 'Volatility', value: riskMetrics.volatility * 100 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="value" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="position-sizing" className="space-y-4">
          {positionSizing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Position Sizing Methods
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Kelly Criterion</span>
                      <Badge variant="outline">{formatPercent(positionSizing.kellyPercentage)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Optimal F</span>
                      <Badge variant="outline">{formatPercent(positionSizing.optimalF)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Fixed Fractional</span>
                      <Badge variant="outline">{formatPercent(positionSizing.fixedFractional)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Volatility Scaled</span>
                      <Badge variant="outline">{positionSizing.volatilityScaled.toFixed(2)}x</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Position Size Comparison</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { method: 'Kelly', size: positionSizing.kellyPercentage * 100 },
                        { method: 'Optimal F', size: positionSizing.optimalF * 100 },
                        { method: 'Fixed Frac', size: positionSizing.fixedFractional * 100 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="method" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="size" fill="hsl(var(--secondary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {portfolioOptimization && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-4 w-4" />
                    Optimal Portfolio Weights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Portfolio Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Expected Return</span>
                      <Badge>{formatPercent(portfolioOptimization.expectedReturn)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Volatility</span>
                      <Badge variant="outline">{formatPercent(portfolioOptimization.volatility)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Sharpe Ratio</span>
                      <Badge variant="secondary">{portfolioOptimization.sharpeRatio.toFixed(3)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Diversification Ratio</span>
                      <Badge variant="outline">{portfolioOptimization.diversificationRatio.toFixed(3)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="stress-testing" className="space-y-4">
          {stressTestResults && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">5th Percentile</p>
                      <p className="text-lg font-bold text-destructive">
                        {formatPercent(stressTestResults.percentiles.p5)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">25th Percentile</p>
                      <p className="text-lg font-bold text-warning">
                        {formatPercent(stressTestResults.percentiles.p25)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Median</p>
                      <p className="text-lg font-bold">
                        {formatPercent(stressTestResults.percentiles.p50)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">75th Percentile</p>
                      <p className="text-lg font-bold text-success">
                        {formatPercent(stressTestResults.percentiles.p75)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">95th Percentile</p>
                      <p className="text-lg font-bold text-success">
                        {formatPercent(stressTestResults.percentiles.p95)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Monte Carlo Stress Test Scenarios
                  </CardTitle>
                  <CardDescription>
                    Portfolio performance under 1,000 simulated scenarios over 1 year
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stressScenarioData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="day" 
                          stroke="hsl(var(--muted-foreground))"
                          label={{ value: 'Trading Days', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          label={{ value: 'Return (%)', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="return"
                          stroke="hsl(var(--primary))"
                          strokeWidth={1}
                          dot={false}
                          strokeOpacity={0.6}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};