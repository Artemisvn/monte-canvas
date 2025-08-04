import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Activity } from 'lucide-react';

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

interface SimulationChartProps {
  simulationData: SimulationData;
  ticker: string;
}

export const SimulationChart: React.FC<SimulationChartProps> = ({ simulationData, ticker }) => {
  const { paths, currentPrice, statistics } = simulationData;
  
  // Sample a subset of paths for visualization (max 50 for performance)
  const sampleSize = Math.min(50, paths.length);
  const sampledPaths = paths.slice(0, sampleSize);
  
  // Prepare data for chart
  const chartData = Array.from({ length: paths[0].length }, (_, day) => {
    const dataPoint: any = { day };
    
    // Add sample paths
    sampledPaths.forEach((path, index) => {
      dataPoint[`path${index}`] = path[day];
    });
    
    // Add statistical bounds
    dataPoint.p5 = statistics.percentile5 * (day / (paths[0].length - 1)) + currentPrice * (1 - day / (paths[0].length - 1));
    dataPoint.p95 = statistics.percentile95 * (day / (paths[0].length - 1)) + currentPrice * (1 - day / (paths[0].length - 1));
    dataPoint.average = statistics.averageEndingPrice * (day / (paths[0].length - 1)) + currentPrice * (1 - day / (paths[0].length - 1));
    
    return dataPoint;
  });

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Price Paths Chart */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Simulated Price Paths
          </CardTitle>
          <CardDescription>
            Sample of {sampleSize} simulated price paths for {ticker}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tickFormatter={formatPrice}
                  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), 'Price']}
                  labelFormatter={(day) => `Day ${day}`}
                />
                
                {/* Reference line for current price */}
                <ReferenceLine 
                  y={currentPrice} 
                  stroke="hsl(var(--primary))" 
                  strokeDasharray="5 5"
                  label={{ value: "Current Price", position: "left" }}
                />
                
                {/* Sample paths */}
                {sampledPaths.map((_, index) => (
                  <Line
                    key={`path${index}`}
                    type="monotone"
                    dataKey={`path${index}`}
                    stroke={`hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                    strokeWidth={1}
                    dot={false}
                    strokeOpacity={0.6}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Statistical Bounds Chart */}
      <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Confidence Intervals
          </CardTitle>
          <CardDescription>
            5th, 50th (average), and 95th percentile projections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="day" 
                  label={{ value: 'Days', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  tickFormatter={formatPrice}
                  label={{ value: 'Price ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => {
                    const labels: Record<string, string> = {
                      p5: '5th Percentile',
                      average: 'Average',
                      p95: '95th Percentile'
                    };
                    return [formatPrice(value), labels[name] || name];
                  }}
                  labelFormatter={(day) => `Day ${day}`}
                />
                
                {/* Reference line for current price */}
                <ReferenceLine 
                  y={currentPrice} 
                  stroke="hsl(var(--muted-foreground))" 
                  strokeDasharray="5 5"
                  label={{ value: "Current", position: "left" }}
                />
                
                {/* Statistical lines */}
                <Line
                  type="monotone"
                  dataKey="p5"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                  name="p5"
                />
                <Line
                  type="monotone"
                  dataKey="average"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={false}
                  name="average"
                />
                <Line
                  type="monotone"
                  dataKey="p95"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={false}
                  name="p95"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};