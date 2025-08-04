import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Loader2, 
  TrendingUp, 
  BarChart3, 
  Calculator, 
  Download, 
  Save, 
  FolderOpen, 
  FileText, 
  Trash2,
  Sparkles,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SimulationChart } from './SimulationChart';
import { SimulationResults } from './SimulationResults';
import { PresetTemplates } from './PresetTemplates';
import { 
  runMonteCarloSimulation, 
  fetchRealStockData, 
  exportToCSV, 
  exportToPDF,
  saveScenario,
  loadScenario,
  getStoredScenarios,
  deleteScenario
} from '@/lib/monteCarlo';

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
  companyName: string;
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
  const [savedScenarios, setSavedScenarios] = useState<Record<string, any>>({});
  const [scenarioName, setScenarioName] = useState('');
  const [selectedScenario, setSelectedScenario] = useState('');
  const { toast } = useToast();

  // Load saved scenarios on mount
  useEffect(() => {
    setSavedScenarios(getStoredScenarios());
  }, []);

  const handleInputChange = (field: keyof SimulationParams, value: string | number) => {
    setParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadPreset = (preset: SimulationParams) => {
    setParams(preset);
    toast({
      title: "Preset Loaded",
      description: `Applied ${preset.ticker} simulation preset`,
    });
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
      // Fetch stock data
      let { expectedReturn, volatility } = params;
      const stockData = await fetchRealStockData(params.ticker);
      
      if (!expectedReturn || !volatility) {
        expectedReturn = stockData.expectedReturn;
        volatility = stockData.volatility;
        
        toast({
          title: "Stock Data Fetched",
          description: `${stockData.companyName}: Return ${(expectedReturn * 100).toFixed(2)}%, Volatility ${(volatility * 100).toFixed(2)}%`,
        });
      }

      // Run Monte Carlo simulation
      const results = runMonteCarloSimulation({
        currentPrice: stockData.currentPrice,
        expectedReturn,
        volatility,
        timeHorizon: params.timeHorizon,
        numSimulations: params.numSimulations,
      });

      setSimulationData({
        paths: results.paths,
        finalPrices: results.finalPrices,
        currentPrice: stockData.currentPrice,
        companyName: stockData.companyName,
        statistics: results.statistics,
      });

      toast({
        title: "Simulation Complete",
        description: `Generated ${params.numSimulations} price paths for ${stockData.companyName}`,
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

  const handleSaveScenario = () => {
    if (!scenarioName.trim() || !simulationData) return;
    
    const scenarioData = {
      params,
      simulationData,
      metadata: {
        ticker: params.ticker,
        companyName: simulationData.companyName,
        simulationCount: params.numSimulations,
        timeHorizon: params.timeHorizon
      }
    };
    
    saveScenario(scenarioName, scenarioData);
    setSavedScenarios(getStoredScenarios());
    setScenarioName('');
    
    toast({
      title: "Scenario Saved",
      description: `"${scenarioName}" has been saved to your scenarios`,
    });
  };

  const handleLoadScenario = () => {
    if (!selectedScenario) return;
    
    const scenario = loadScenario(selectedScenario);
    if (scenario) {
      setParams(scenario.params);
      setSimulationData(scenario.simulationData);
      setSelectedScenario('');
      
      toast({
        title: "Scenario Loaded",
        description: `"${selectedScenario}" has been loaded`,
      });
    }
  };

  const handleDeleteScenario = (name: string) => {
    deleteScenario(name);
    setSavedScenarios(getStoredScenarios());
    
    toast({
      title: "Scenario Deleted",
      description: `"${name}" has been removed`,
    });
  };

  const handleExportCSV = () => {
    if (!simulationData) return;
    
    exportToCSV({
      paths: simulationData.paths,
      finalPrices: simulationData.finalPrices,
      statistics: simulationData.statistics
    }, `monte_carlo_${params.ticker}_${new Date().toISOString().split('T')[0]}.csv`);
    
    toast({
      title: "CSV Exported",
      description: "Simulation data has been downloaded as CSV",
    });
  };

  const handleExportPDF = () => {
    if (!simulationData) return;
    
    exportToPDF({
      statistics: simulationData.statistics,
      finalPrices: simulationData.finalPrices
    }, params.ticker, {
      ...params,
      currentPrice: simulationData.currentPrice,
      expectedReturn: params.expectedReturn || 0.12,
      volatility: params.volatility || 0.25
    });
    
    toast({
      title: "PDF Report Generated",
      description: "Detailed report has been downloaded as PDF",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary-glow text-primary-foreground animate-pulse-glow">
              <TrendingUp className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Monte Carlo Stock Simulator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Advanced financial modeling with real-time data, risk analysis, and professional reporting capabilities.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-4 justify-center">
          <PresetTemplates onLoadPreset={loadPreset} />
          
          {/* Save Scenario */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={!simulationData}>
                <Save className="h-4 w-4 mr-2" />
                Save Scenario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Simulation Scenario</DialogTitle>
                <DialogDescription>
                  Save your current simulation parameters and results for future reference.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="scenario-name">Scenario Name</Label>
                  <Input
                    id="scenario-name"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="e.g., Apple Conservative Analysis"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSaveScenario} disabled={!scenarioName.trim()}>
                  Save Scenario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Load Scenario */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={Object.keys(savedScenarios).length === 0}>
                <FolderOpen className="h-4 w-4 mr-2" />
                Load Scenario ({Object.keys(savedScenarios).length})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Load Saved Scenario</DialogTitle>
                <DialogDescription>
                  Choose from your previously saved simulation scenarios.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(savedScenarios).map(([name, scenario]) => (
                      <SelectItem key={name} value={name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{name}</span>
                          <div className="flex gap-2 ml-4">
                            <Badge variant="secondary" className="text-xs">
                              {scenario.metadata?.ticker}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(scenario.savedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {Object.keys(savedScenarios).length > 0 && (
                  <div className="space-y-2">
                    <Label>Manage Scenarios</Label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {Object.entries(savedScenarios).map(([name, scenario]) => (
                        <div key={name} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{name}</div>
                            <div className="text-xs text-muted-foreground">
                              {scenario.metadata?.companyName} • {new Date(scenario.savedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteScenario(name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button onClick={handleLoadScenario} disabled={!selectedScenario}>
                  Load Scenario
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Export Options */}
          {simulationData && (
            <>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <FileText className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </>
          )}
        </div>

        {/* Simulation Parameters */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Simulation Parameters
            </CardTitle>
            <CardDescription>
              Configure your Monte Carlo simulation settings with real-time market data
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
                  className="font-mono transition-all hover:border-primary/50 focus:border-primary"
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
                  className="transition-all hover:border-primary/50 focus:border-primary"
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
                  className="transition-all hover:border-primary/50 focus:border-primary"
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
                  placeholder="Auto-fetch from market data"
                  className="transition-all hover:border-primary/50 focus:border-primary"
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
                  placeholder="Auto-calculate from historical data"
                  className="transition-all hover:border-primary/50 focus:border-primary"
                />
              </div>
            </div>
            
            <Separator />
            
            <Button 
              onClick={runSimulation} 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  <span className="animate-pulse">Running Advanced Simulation...</span>
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Run Monte Carlo Simulation
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {simulationData && (
          <div className="space-y-8 animate-fade-in">
            <SimulationChart simulationData={simulationData} ticker={params.ticker} />
            <SimulationResults simulationData={simulationData} ticker={params.ticker} />
          </div>
        )}
      </div>
    </div>
  );
};