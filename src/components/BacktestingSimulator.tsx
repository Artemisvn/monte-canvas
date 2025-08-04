import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TrendingUp, 
  BarChart3, 
  Calculator, 
  Play, 
  Loader2,
  Settings,
  FileText,
  Target
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  BacktestEngine,
  BacktestParams,
  BacktestResult,
  getAvailableStrategies,
  createStrategy,
  TradingStrategy
} from '@/lib/backtesting';
import { BacktestChart } from './BacktestChart';
import { BacktestResults } from './BacktestResults';
import { StrategyBuilder } from './StrategyBuilder';

export const BacktestingSimulator: React.FC = () => {
  const [symbol, setSymbol] = useState('AAPL');
  const [startDate, setStartDate] = useState('2023-01-01');
  const [endDate, setEndDate] = useState('2024-01-01');
  const [initialCapital, setInitialCapital] = useState(100000);
  const [commission, setCommission] = useState(1);
  const [slippage, setSlippage] = useState(0.001);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('Moving Average Crossover');
  const [strategyParams, setStrategyParams] = useState<any>({});
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  
  const { toast } = useToast();
  const engine = new BacktestEngine();
  const availableStrategies = getAvailableStrategies();

  const runBacktest = async () => {
    if (!symbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid ticker symbol",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    try {
      const strategy = createStrategy(selectedStrategy, strategyParams);
      if (!strategy) {
        throw new Error('Invalid strategy');
      }

      const params: BacktestParams = {
        symbol: symbol.toUpperCase(),
        startDate,
        endDate,
        initialCapital,
        commission,
        slippage,
        strategy
      };

      const backtestResult = await engine.runBacktest(params);
      setResult(backtestResult);
      
      toast({
        title: "Backtest Complete",
        description: `Strategy tested with ${backtestResult.trades.length} trades`,
      });
    } catch (error) {
      console.error('Backtest error:', error);
      toast({
        title: "Backtest Failed",
        description: "An error occurred during backtesting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

  const currentStrategy = availableStrategies.find(s => s.name === selectedStrategy);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Strategy Backtesting
          </h1>
          <p className="text-muted-foreground text-lg">
            Test and evaluate trading strategies with historical data
          </p>
        </div>

        <Tabs defaultValue="setup" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="setup">Strategy Setup</TabsTrigger>
            <TabsTrigger value="results">Backtest Results</TabsTrigger>
            <TabsTrigger value="analysis">Performance Analysis</TabsTrigger>
            <TabsTrigger value="builder">Strategy Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Basic Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="symbol">Symbol</Label>
                    <Input
                      id="symbol"
                      placeholder="AAPL"
                      value={symbol}
                      onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="initialCapital">Initial Capital</Label>
                    <Input
                      id="initialCapital"
                      type="number"
                      value={initialCapital}
                      onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="commission">Commission ($)</Label>
                      <Input
                        id="commission"
                        type="number"
                        step="0.01"
                        value={commission}
                        onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slippage">Slippage (%)</Label>
                      <Input
                        id="slippage"
                        type="number"
                        step="0.001"
                        value={slippage * 100}
                        onChange={(e) => setSlippage((parseFloat(e.target.value) || 0) / 100)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strategy Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Strategy Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Trading Strategy</Label>
                    <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableStrategies.map((strategy) => (
                          <SelectItem key={strategy.name} value={strategy.name}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {currentStrategy && (
                    <div className="space-y-3">
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          {currentStrategy.description}
                        </p>
                      </div>

                      <Separator />
                      
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Strategy Parameters</Label>
                        {Object.entries(currentStrategy.parameters).map(([key, value]) => (
                          <div key={key} className="space-y-1">
                            <Label htmlFor={key} className="text-xs capitalize">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Label>
                            <Input
                              id={key}
                              type="number"
                              step={typeof value === 'number' && value < 1 ? "0.01" : "1"}
                              value={strategyParams[key] || value}
                              onChange={(e) => setStrategyParams(prev => ({
                                ...prev,
                                [key]: parseFloat(e.target.value) || value
                              }))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Run Backtest */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="h-5 w-5" />
                    Execute Backtest
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Symbol:</span>
                        <Badge variant="outline">{symbol}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Period:</span>
                        <span className="text-xs">{startDate} to {endDate}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Capital:</span>
                        <span className="font-medium">{formatCurrency(initialCapital)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Strategy:</span>
                        <span className="text-xs">{selectedStrategy}</span>
                      </div>
                    </div>

                    <Button 
                      onClick={runBacktest} 
                      disabled={isRunning}
                      className="w-full"
                      size="lg"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running Backtest...
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Run Backtest
                        </>
                      )}
                    </Button>

                    {result && (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Return:</span>
                          <span className={`font-bold ${result.performance.totalReturn >= 0 ? 'text-success' : 'text-destructive'}`}>
                            {formatPercent(result.performance.totalReturn)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sharpe Ratio:</span>
                          <span className="font-medium">{result.performance.sharpeRatio.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Drawdown:</span>
                          <span className="text-destructive">{formatPercent(result.performance.maxDrawdown)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Trades:</span>
                          <span>{result.performance.totalTrades}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="results">
            {result ? (
              <BacktestChart result={result} symbol={symbol} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Backtest Results</h3>
                  <p className="text-muted-foreground text-center">
                    Configure your strategy and run a backtest to see results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="analysis">
            {result ? (
              <BacktestResults result={result} initialCapital={initialCapital} />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Performance Analysis</h3>
                  <p className="text-muted-foreground text-center">
                    Run a backtest to see detailed performance analysis and metrics.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="builder">
            <StrategyBuilder onStrategyCreated={(strategy) => {
              setSelectedStrategy(strategy.name);
              toast({
                title: "Custom Strategy Created",
                description: `${strategy.name} is now available for backtesting`,
              });
            }} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};