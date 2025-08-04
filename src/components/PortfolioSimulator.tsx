import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  TrendingUp, 
  Plus, 
  Minus, 
  BarChart3, 
  Download,
  Loader2,
  Target,
  DollarSign
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  Asset, 
  PortfolioParams, 
  PortfolioResults, 
  runPortfolioSimulation,
  getPortfolioPresets,
  calculateEfficientFrontier,
  EfficientFrontierPoint
} from '@/lib/portfolio';
import { PortfolioChart } from './PortfolioChart';
import { PortfolioResults as PortfolioResultsComponent } from './PortfolioResults';
import { EfficientFrontierChart } from './EfficientFrontierChart';

export const PortfolioSimulator: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([
    { ticker: 'AAPL', name: 'Apple', weight: 0.4 },
    { ticker: 'MSFT', name: 'Microsoft', weight: 0.3 },
    { ticker: 'GOOGL', name: 'Alphabet', weight: 0.3 }
  ]);
  
  const [timeHorizon, setTimeHorizon] = useState(252);
  const [numSimulations, setNumSimulations] = useState(1000);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PortfolioResults | null>(null);
  const [efficientFrontier, setEfficientFrontier] = useState<EfficientFrontierPoint[] | null>(null);
  const [isCalculatingFrontier, setIsCalculatingFrontier] = useState(false);
  const { toast } = useToast();

  const presets = getPortfolioPresets();

  const addAsset = () => {
    const newAsset: Asset = {
      ticker: '',
      name: '',
      weight: 0
    };
    setAssets([...assets, newAsset]);
  };

  const removeAsset = (index: number) => {
    if (assets.length > 1) {
      setAssets(assets.filter((_, i) => i !== index));
    }
  };

  const updateAsset = (index: number, field: keyof Asset, value: string | number) => {
    const updatedAssets = [...assets];
    updatedAssets[index] = { ...updatedAssets[index], [field]: value };
    setAssets(updatedAssets);
  };

  const normalizeWeights = () => {
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    if (totalWeight > 0) {
      const normalizedAssets = assets.map(asset => ({
        ...asset,
        weight: asset.weight / totalWeight
      }));
      setAssets(normalizedAssets);
      toast({
        title: "Weights Normalized",
        description: "Portfolio weights have been adjusted to sum to 100%",
      });
    }
  };

  const loadPreset = (presetAssets: Asset[]) => {
    setAssets([...presetAssets]);
    toast({
      title: "Preset Loaded",
      description: "Portfolio preset has been applied",
    });
  };

  const runSimulation = async () => {
    // Validate portfolio
    const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
    const validAssets = assets.filter(asset => asset.ticker.trim() && asset.weight > 0);
    
    if (validAssets.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one asset with a ticker symbol and weight",
        variant: "destructive",
      });
      return;
    }

    if (Math.abs(totalWeight - 1) > 0.01) {
      toast({
        title: "Error",
        description: "Portfolio weights must sum to 100% (1.0). Click 'Normalize Weights' to fix this.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const params: PortfolioParams = {
        assets: validAssets,
        timeHorizon,
        numSimulations,
        correlationMethod: 'historical'
      };

      const portfolioResults = await runPortfolioSimulation(params);
      setResults(portfolioResults);
      
      toast({
        title: "Simulation Complete",
        description: `Generated ${numSimulations} portfolio scenarios`,
      });
    } catch (error) {
      console.error('Simulation error:', error);
      toast({
        title: "Simulation Failed",
        description: "An error occurred during the simulation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateFrontier = async () => {
    const validAssets = assets.filter(asset => asset.ticker.trim());
    
    if (validAssets.length < 2) {
      toast({
        title: "Error",
        description: "Need at least 2 assets to calculate efficient frontier",
        variant: "destructive",
      });
      return;
    }

    setIsCalculatingFrontier(true);
    try {
      const frontierPoints = await calculateEfficientFrontier(validAssets, 30);
      setEfficientFrontier(frontierPoints);
      
      toast({
        title: "Efficient Frontier Calculated",
        description: "Risk-return optimization complete",
      });
    } catch (error) {
      console.error('Efficient frontier error:', error);
      toast({
        title: "Calculation Failed",
        description: "Failed to calculate efficient frontier",
        variant: "destructive",
      });
    } finally {
      setIsCalculatingFrontier(false);
    }
  };

  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
  const isWeightValid = Math.abs(totalWeight - 1) < 0.01;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Portfolio Simulator
          </h1>
          <p className="text-muted-foreground text-lg">
            Monte Carlo simulation and optimization for multi-asset portfolios
          </p>
        </div>

        <Tabs defaultValue="portfolio" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="portfolio">Portfolio Setup</TabsTrigger>
            <TabsTrigger value="simulation">Simulation Results</TabsTrigger>
            <TabsTrigger value="optimization">Optimization</TabsTrigger>
          </TabsList>

          <TabsContent value="portfolio" className="space-y-6">
            {/* Portfolio Configuration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Asset Configuration */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      Portfolio Assets
                    </CardTitle>
                    <CardDescription>
                      Configure your portfolio assets and weights
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Weight Summary */}
                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">Total Weight:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={isWeightValid ? "default" : "destructive"}>
                          {(totalWeight * 100).toFixed(1)}%
                        </Badge>
                        {!isWeightValid && (
                          <Button size="sm" variant="outline" onClick={normalizeWeights}>
                            Normalize Weights
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Assets List */}
                    <div className="space-y-3">
                      {assets.map((asset, index) => (
                        <div key={index} className="grid grid-cols-12 gap-3 items-center p-3 border rounded-lg">
                          <div className="col-span-3">
                            <Label htmlFor={`ticker-${index}`} className="text-xs">Ticker</Label>
                            <Input
                              id={`ticker-${index}`}
                              placeholder="AAPL"
                              value={asset.ticker}
                              onChange={(e) => updateAsset(index, 'ticker', e.target.value.toUpperCase())}
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-4">
                            <Label htmlFor={`name-${index}`} className="text-xs">Name</Label>
                            <Input
                              id={`name-${index}`}
                              placeholder="Apple Inc."
                              value={asset.name}
                              onChange={(e) => updateAsset(index, 'name', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-3">
                            <Label htmlFor={`weight-${index}`} className="text-xs">Weight</Label>
                            <Input
                              id={`weight-${index}`}
                              type="number"
                              step="0.01"
                              min="0"
                              max="1"
                              placeholder="0.25"
                              value={asset.weight}
                              onChange={(e) => updateAsset(index, 'weight', parseFloat(e.target.value) || 0)}
                              className="mt-1"
                            />
                          </div>
                          <div className="col-span-2 flex justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeAsset(index)}
                              disabled={assets.length === 1}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button onClick={addAsset} variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Asset
                    </Button>

                    {/* Presets */}
                    <Separator />
                    <div className="space-y-2">
                      <Label>Portfolio Presets</Label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {presets.map((preset, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            onClick={() => loadPreset(preset.assets)}
                            className="text-xs"
                          >
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Simulation Parameters */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Simulation Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="timeHorizon">Time Horizon (Days)</Label>
                      <Select value={timeHorizon.toString()} onValueChange={(value) => setTimeHorizon(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="63">3 Months</SelectItem>
                          <SelectItem value="126">6 Months</SelectItem>
                          <SelectItem value="252">1 Year</SelectItem>
                          <SelectItem value="504">2 Years</SelectItem>
                          <SelectItem value="1260">5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="numSimulations">Number of Simulations</Label>
                      <Select value={numSimulations.toString()} onValueChange={(value) => setNumSimulations(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="500">500 (Fast)</SelectItem>
                          <SelectItem value="1000">1,000 (Standard)</SelectItem>
                          <SelectItem value="5000">5,000 (Detailed)</SelectItem>
                          <SelectItem value="10000">10,000 (Comprehensive)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={runSimulation} 
                      disabled={isLoading || !isWeightValid}
                      className="w-full"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Running Simulation...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="h-4 w-4 mr-2" />
                          Run Portfolio Simulation
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="simulation">
            {results ? (
              <div className="space-y-6">
                <PortfolioChart results={results} />
                <PortfolioResultsComponent results={results} assets={assets} />
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Simulation Results</h3>
                  <p className="text-muted-foreground text-center">
                    Configure your portfolio and run a simulation to see results here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="optimization">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Efficient Frontier Analysis
                  </CardTitle>
                  <CardDescription>
                    Optimize your portfolio for the best risk-return trade-off
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={calculateFrontier}
                    disabled={isCalculatingFrontier}
                    className="mb-4"
                  >
                    {isCalculatingFrontier ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Calculating...
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Calculate Efficient Frontier
                      </>
                    )}
                  </Button>
                  
                  {efficientFrontier && (
                    <EfficientFrontierChart 
                      frontierPoints={efficientFrontier}
                      currentPortfolio={results}
                    />
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};