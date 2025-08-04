import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, TrendingUp, BarChart3, Calculator } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SimulationChart } from './SimulationChart';
import { SimulationResults } from './SimulationResults';
import { runMonteCarloSimulation, fetchStockData } from '@/lib/monteCarlo';

interface SimulationParams {
  ticker: string;
  numSimulations: number;
  timeHorizon: number;
  expectedReturn?: number;
  volatility?: number;
}

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

export const MonteCarloSimulator: React.FC = () => {
  const [params, setParams] = useState<SimulationParams>({
    ticker: 'AAPL',
    numSimulations: 1000,
    timeHorizon: 252, // 1 year of trading days
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null);
  const { toast } = useToast();

  const handleInputChange = (field: keyof SimulationParams, value: string | number) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const runSimulation = async () => {
    if (!params.ticker.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid ticker symbol",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setSimulationData(null);

    try {
      // Fetch stock data if return/volatility not provided
      let { expectedReturn, volatility } = params;
      let currentPrice: number;

      if (!expectedReturn || !volatility) {
        const stockData = await fetchStockData(params.ticker);
        expectedReturn = stockData.expectedReturn;
        volatility = stockData.volatility;
        currentPrice = stockData.currentPrice;
        
        toast({
          title: "Stock Data Fetched",
          description: `Using historical data: Return ${(expectedReturn * 100).toFixed(2)}%, Volatility ${(volatility * 100).toFixed(2)}%`,
        });
      } else {
        // For demo purposes, use a default current price if not fetching data
        currentPrice = 150;
      }

      // Run Monte Carlo simulation
      const results = runMonteCarloSimulation({
        currentPrice,
        expectedReturn,
        volatility,
        timeHorizon: params.timeHorizon,
        numSimulations: params.numSimulations,
      });

      setSimulationData({
        paths: results.paths,
        finalPrices: results.finalPrices,
        currentPrice,
        statistics: results.statistics,
      });

      toast({
        title: "Simulation Complete",
        description: `Generated ${params.numSimulations} price paths for ${params.ticker}`,
      });

    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Monte Carlo Stock Simulator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Simulate thousands of possible stock price paths using advanced mathematical models to assess risk and potential returns.
          </p>
        </div>

        {/* Simulation Parameters */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Simulation Parameters
            </CardTitle>
            <CardDescription>
              Configure your Monte Carlo simulation settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="ticker">Stock Ticker</Label>
                <Input
                  id="ticker"
                  value={params.ticker}
                  onChange={(e) => handleInputChange('ticker', e.target.value.toUpperCase())}
                  placeholder="e.g., AAPL, TSLA, MSFT"
                  className="font-mono"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="numSimulations">Number of Simulations</Label>
                <Input
                  id="numSimulations"
                  type="number"
                  value={params.numSimulations}
                  onChange={(e) => handleInputChange('numSimulations', parseInt(e.target.value))}
                  min="100"
                  max="10000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timeHorizon">Time Horizon (Days)</Label>
                <Input
                  id="timeHorizon"
                  type="number"
                  value={params.timeHorizon}
                  onChange={(e) => handleInputChange('timeHorizon', parseInt(e.target.value))}
                  min="1"
                  max="1000"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="expectedReturn">Expected Annual Return (%) - Optional</Label>
                <Input
                  id="expectedReturn"
                  type="number"
                  step="0.01"
                  value={params.expectedReturn || ''}
                  onChange={(e) => handleInputChange('expectedReturn', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
                  placeholder="Leave empty to use historical data"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="volatility">Annual Volatility (%) - Optional</Label>
                <Input
                  id="volatility"
                  type="number"
                  step="0.01"
                  value={params.volatility || ''}
                  onChange={(e) => handleInputChange('volatility', e.target.value ? parseFloat(e.target.value) / 100 : undefined)}
                  placeholder="Leave empty to use historical data"
                />
              </div>
            </div>
            
            <Button 
              onClick={runSimulation} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-transform"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Running Simulation...
                </>
              ) : (
                <>
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Run Monte Carlo Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {simulationData && (
          <div className="space-y-8">
            <SimulationChart simulationData={simulationData} ticker={params.ticker} />
            <SimulationResults simulationData={simulationData} ticker={params.ticker} />
          </div>
        )}
      </div>
    </div>
  );
};