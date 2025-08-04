import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart } from 'recharts';
import { TrendingUp, Activity, Eye, EyeOff, Settings, Maximize, BarChart3 } from 'lucide-react';

interface SimulationData {
  paths: number[][];
  finalPrices: number[];
  currentPrice: number;
  companyName?: string;
  statistics: {
    averageEndingPrice: number;
    probabilityOfGain: number;
    percentile5: number;
    percentile95: number;
    maxPrice: number;
    minPrice: number;
  };
}

interface SimulationChartProps {
  simulationData: SimulationData;
  ticker: string;
}

export const SimulationChart: React.FC<SimulationChartProps> = ({ simulationData, ticker }) => {
  const { paths, currentPrice, statistics, companyName } = simulationData;
  
  // State for interactive controls
  const [sampleSize, setSampleSize] = useState(Math.min(50, paths.length));
  const [showPaths, setShowPaths] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [chartType, setChartType] = useState<'lines' | 'area'>('lines');
  
  // Memoized chart data for performance
  const chartData = useMemo(() => {
    const selectedPaths = paths.slice(0, sampleSize);
    
    return Array.from({ length: paths[0].length }, (_, day) => {
      const dataPoint: any = { day };
      
      // Add sample paths
      if (showPaths) {
        selectedPaths.forEach((path, index) => {
          dataPoint[`path${index}`] = path[day];
        });
      }
      
      // Add statistical bounds with smooth interpolation
      const progress = day / (paths[0].length - 1);
      dataPoint.p5 = currentPrice + (statistics.percentile5 - currentPrice) * progress;
      dataPoint.p95 = currentPrice + (statistics.percentile95 - currentPrice) * progress;
      dataPoint.average = currentPrice + (statistics.averageEndingPrice - currentPrice) * progress;
      
      // Confidence band for area chart
      dataPoint.confidenceBand = [dataPoint.p5, dataPoint.p95];
      
      return dataPoint;
    });
  }, [paths, sampleSize, showPaths, currentPrice, statistics]);

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatDay = (day: number) => {
    if (day === 0) return 'Today';
    if (day < 30) return `${day}d`;
    if (day < 252) return `${Math.round(day / 21)}m`;
    return `${Math.round(day / 252)}y`;
  };
  
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Interactive Controls */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Chart Controls
            </span>
            <div className="flex gap-2">
              <Badge variant="outline">
                {companyName || ticker}
              </Badge>
              <Badge variant="secondary">
                {paths.length.toLocaleString()} simulations
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sample Size Control */}
            <div className="space-y-3">
              <Label>Displayed Paths: {sampleSize}</Label>
              <Slider
                value={[sampleSize]}
                onValueChange={(value) => setSampleSize(value[0])}
                max={Math.min(100, paths.length)}
                min={10}
                step={10}
                className="w-full"
              />
            </div>
            
            {/* Visibility Toggles */}
            <div className="space-y-3">
              <Label>Display Options</Label>
              <div className="flex gap-2">
                <Button
                  variant={showPaths ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowPaths(!showPaths)}
                >
                  {showPaths ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Paths
                </Button>
                <Button
                  variant={showConfidence ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowConfidence(!showConfidence)}
                >
                  {showConfidence ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  Confidence
                </Button>
              </div>
            </div>
            
            {/* Chart Type */}
            <div className="space-y-3">
              <Label>Chart Style</Label>
              <div className="flex gap-2">
                <Button
                  variant={chartType === 'lines' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType('lines')}
                >
                  <Activity className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'area' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setChartType('area')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Price Paths Chart */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Simulated Price Paths
            </CardTitle>
            <CardDescription>
              {sampleSize} of {paths.length.toLocaleString()} simulation paths for {ticker}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={formatDay}
                    label={{ value: 'Time Horizon', position: 'insideBottom', offset: -10 }}
                  />
                  <YAxis 
                    tickFormatter={formatPrice}
                    label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatPrice(value), 'Price']}
                    labelFormatter={(day) => `Day ${day}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  
                  {/* Reference line for current price */}
                  <ReferenceLine 
                    y={currentPrice} 
                    stroke="hsl(var(--primary))" 
                    strokeDasharray="5 5"
                    strokeWidth={2}
                    label={{ 
                      value: `Current: ${formatPrice(currentPrice)}`, 
                      position: "left",
                      style: { fill: 'hsl(var(--primary))' }
                    }}
                  />
                  
                  {/* Sample paths */}
                  {showPaths && Array.from({ length: sampleSize }, (_, index) => (
                    <Line
                      key={`path${index}`}
                      type="monotone"
                      dataKey={`path${index}`}
                      stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                      strokeWidth={1}
                      dot={false}
                      strokeOpacity={0.6}
                      connectNulls={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Confidence Intervals */}
        <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm animate-scale-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Statistical Projections
            </CardTitle>
            <CardDescription>
              Confidence intervals and expected price trajectory
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 md:h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="day" 
                      tickFormatter={formatDay}
                      label={{ value: 'Time Horizon', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      tickFormatter={formatPrice}
                      label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          p5: '5th Percentile (Worst Case)',
                          average: 'Expected Value',
                          p95: '95th Percentile (Best Case)'
                        };
                        return [formatPrice(value), labels[name] || name];
                      }}
                      labelFormatter={(day) => `Day ${day}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    
                    {/* Confidence band */}
                    <Area
                      type="monotone"
                      dataKey="p95"
                      stackId="1"
                      stroke="hsl(var(--success))"
                      fill="hsl(var(--success) / 0.2)"
                      name="p95"
                    />
                    <Area
                      type="monotone"
                      dataKey="p5"
                      stackId="1"
                      stroke="hsl(var(--destructive))"
                      fill="hsl(var(--background))"
                      name="p5"
                    />
                    
                    {/* Reference line for current price */}
                    <ReferenceLine 
                      y={currentPrice} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="day" 
                      tickFormatter={formatDay}
                      label={{ value: 'Time Horizon', position: 'insideBottom', offset: -10 }}
                    />
                    <YAxis 
                      tickFormatter={formatPrice}
                      label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        const labels: Record<string, string> = {
                          p5: '5th Percentile (Worst Case)',
                          average: 'Expected Value',
                          p95: '95th Percentile (Best Case)'
                        };
                        return [formatPrice(value), labels[name] || name];
                      }}
                      labelFormatter={(day) => `Day ${day}`}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    
                    {/* Reference line for current price */}
                    <ReferenceLine 
                      y={currentPrice} 
                      stroke="hsl(var(--muted-foreground))" 
                      strokeDasharray="5 5"
                    />
                    
                    {showConfidence && (
                      <>
                        <Line
                          type="monotone"
                          dataKey="p5"
                          stroke="hsl(var(--destructive))"
                          strokeWidth={3}
                          dot={false}
                          name="p5"
                        />
                        <Line
                          type="monotone"
                          dataKey="p95"
                          stroke="hsl(var(--success))"
                          strokeWidth={3}
                          dot={false}
                          name="p95"
                        />
                      </>
                    )}
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="hsl(var(--primary))"
                      strokeWidth={4}
                      dot={false}
                      name="average"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};