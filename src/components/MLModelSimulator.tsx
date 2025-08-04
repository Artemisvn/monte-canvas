import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
// import { MLPredictor, LinearRegressionModel, RandomForestModel, LSTMModel } from '@/lib/mlModels';
import { MonteCarloSimulator } from '@/components/MonteCarloSimulator';
import { Brain, TrendingUp, Zap, BarChart3 } from 'lucide-react';

export const MLModelSimulator: React.FC = () => {
  const [selectedModel, setSelectedModel] = useState<'linear' | 'randomforest' | 'lstm'>('linear');
  const [symbol, setSymbol] = useState('AAPL');
  const [predictionHorizon, setPredictionHorizon] = useState(30);
  const [isTraining, setIsTraining] = useState(false);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [modelMetrics, setModelMetrics] = useState<any>(null);

  const handleTrainModel = async () => {
    setIsTraining(true);
    
    // Generate sample data for demonstration
    const sampleData = Array.from({ length: 1000 }, (_, i) => ({
      date: new Date(Date.now() - (1000 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      price: 100 + Math.sin(i * 0.1) * 20 + Math.random() * 10,
      volume: 1000000 + Math.random() * 500000,
      rsi: 30 + Math.random() * 40,
      sma20: 100 + Math.sin(i * 0.1) * 15,
      sma50: 100 + Math.sin(i * 0.05) * 25
    }));

    // Simulate model selection (placeholder for actual ML implementation)
    const modelType = selectedModel;

    // Simulate training and prediction
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const features = sampleData.map(d => [d.rsi, d.sma20, d.sma50, d.volume / 1000000]);
    const targets = sampleData.map(d => d.price);
    
    const accuracy = 0.75 + Math.random() * 0.2;
    const mse = Math.random() * 50;
    const mae = Math.random() * 20;
    
    setModelMetrics({
      accuracy,
      mse,
      mae,
      r2Score: accuracy
    });

    // Generate predictions
    const predictionData = Array.from({ length: predictionHorizon }, (_, i) => {
      const lastPrice = sampleData[sampleData.length - 1].price;
      const trend = (Math.random() - 0.5) * 0.02;
      const noise = (Math.random() - 0.5) * 5;
      
      return {
        date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        predicted: lastPrice * (1 + trend * (i + 1)) + noise,
        confidence: 0.6 + Math.random() * 0.3,
        actual: i < 5 ? lastPrice * (1 + trend * (i + 1)) + noise * 0.5 : null
      };
    });

    setPredictions(predictionData);
    setIsTraining(false);
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Machine Learning Trading Models
          </CardTitle>
          <CardDescription>
            Train and deploy ML models for price prediction and signal generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Asset Symbol</Label>
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="AAPL"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Model Type</Label>
              <Select value={selectedModel} onValueChange={(value: any) => setSelectedModel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linear">Linear Regression</SelectItem>
                  <SelectItem value="randomforest">Random Forest</SelectItem>
                  <SelectItem value="lstm">LSTM Neural Network</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Prediction Horizon (days)</Label>
              <Input
                type="number"
                value={predictionHorizon}
                onChange={(e) => setPredictionHorizon(Number(e.target.value))}
                min="1"
                max="90"
              />
            </div>
            
            <div className="flex items-end">
              <Button onClick={handleTrainModel} disabled={isTraining}>
                {isTraining ? 'Training...' : 'Train Model'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="model-metrics">Model Metrics</TabsTrigger>
          <TabsTrigger value="monte-carlo">Monte Carlo</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-4">
          {predictions.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Price Predictions - {symbol}
                  </CardTitle>
                  <CardDescription>
                    {selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} model predictions for next {predictionHorizon} days
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={predictions}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          tickFormatter={formatCurrency}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            name === 'predicted' ? formatCurrency(value) : formatPercent(value),
                            name === 'predicted' ? 'Predicted Price' : 'Confidence'
                          ]}
                          labelFormatter={(date: string) => new Date(date).toLocaleDateString()}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="predicted"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                          name="predicted"
                        />
                        <Line
                          type="monotone"
                          dataKey="confidence"
                          stroke="hsl(var(--secondary))"
                          strokeWidth={1}
                          strokeDasharray="5 5"
                          yAxisId="confidence"
                          name="confidence"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Next Day Prediction</p>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency(predictions[0]?.predicted || 0)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg Confidence</p>
                      <p className="text-lg font-bold">
                        {formatPercent(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Prediction Range</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(Math.min(...predictions.map(p => p.predicted)))} - {formatCurrency(Math.max(...predictions.map(p => p.predicted)))}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="model-metrics" className="space-y-4">
          {modelMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Model Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Accuracy</span>
                      <Badge variant={modelMetrics.accuracy > 0.8 ? "default" : "secondary"}>
                        {formatPercent(modelMetrics.accuracy)}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>R² Score</span>
                      <Badge variant="outline">{modelMetrics.r2Score.toFixed(3)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Mean Squared Error</span>
                      <Badge variant="outline">{modelMetrics.mse.toFixed(2)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Mean Absolute Error</span>
                      <Badge variant="outline">{modelMetrics.mae.toFixed(2)}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Model Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Model Type</span>
                      <Badge>{selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Training Data</span>
                      <Badge variant="outline">1000 samples</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Features</span>
                      <Badge variant="outline">4 indicators</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Prediction Horizon</span>
                      <Badge variant="outline">{predictionHorizon} days</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monte-carlo" className="space-y-4">
          <MonteCarloSimulator />
        </TabsContent>
      </Tabs>
    </div>
  );
};