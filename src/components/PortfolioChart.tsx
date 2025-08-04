import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PortfolioResults } from '@/lib/portfolio';
import { TrendingUp, BarChart, Eye, EyeOff } from 'lucide-react';

interface PortfolioChartProps {
  results: PortfolioResults;
}

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ results }) => {
  const [sampleSize, setSampleSize] = useState([100]);
  const [showPaths, setShowPaths] = useState(true);
  const [showConfidence, setShowConfidence] = useState(true);
  const [chartType, setChartType] = useState<'paths' | 'distribution'>('paths');

  const chartData = useMemo(() => {
    const numPaths = Math.min(sampleSize[0], results.paths.length);
    const selectedPaths = results.paths.slice(0, numPaths);
    const timeHorizon = results.paths[0].length;

    if (chartType === 'paths') {
      // Portfolio value paths over time
      const data = [];
      for (let day = 0; day < timeHorizon; day++) {
        const dataPoint: any = { day };
        
        if (showPaths) {
          selectedPaths.forEach((path, index) => {
            if (index < 20) { // Limit visible paths for performance
              dataPoint[`path${index}`] = path[day];
            }
          });
        }

        if (showConfidence) {
          const dayValues = results.paths.map(path => path[day]).sort((a, b) => a - b);
          dataPoint.p5 = dayValues[Math.floor(0.05 * dayValues.length)];
          dataPoint.p25 = dayValues[Math.floor(0.25 * dayValues.length)];
          dataPoint.p50 = dayValues[Math.floor(0.5 * dayValues.length)];
          dataPoint.p75 = dayValues[Math.floor(0.75 * dayValues.length)];
          dataPoint.p95 = dayValues[Math.floor(0.95 * dayValues.length)];
        }

        data.push(dataPoint);
      }
      return data;
    } else {
      // Final value distribution
      const sortedFinalValues = [...results.finalValues].sort((a, b) => a - b);
      const buckets = 50;
      const min = Math.min(...sortedFinalValues);
      const max = Math.max(...sortedFinalValues);
      const bucketSize = (max - min) / buckets;
      
      const distribution = Array.from({ length: buckets }, (_, i) => {
        const bucketStart = min + i * bucketSize;
        const bucketEnd = bucketStart + bucketSize;
        const count = sortedFinalValues.filter(value => value >= bucketStart && value < bucketEnd).length;
        
        return {
          value: bucketStart + bucketSize / 2,
          count,
          probability: count / results.finalValues.length * 100
        };
      });
      
      return distribution;
    }
  }, [results, sampleSize, showPaths, showConfidence, chartType]);

  const formatValue = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatDay = (day: number) => {
    if (day === 0) return 'Start';
    if (day % 63 === 0) return `${day / 63}Q`;
    if (day % 21 === 0) return `${day}d`;
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Visualization Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Chart Type</Label>
              <Select value={chartType} onValueChange={(value: 'paths' | 'distribution') => setChartType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paths">Price Paths</SelectItem>
                  <SelectItem value="distribution">Final Distribution</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {chartType === 'paths' && (
              <>
                <div className="space-y-2">
                  <Label>Sample Paths: {sampleSize[0]}</Label>
                  <Slider
                    value={sampleSize}
                    onValueChange={setSampleSize}
                    max={Math.min(500, results.paths.length)}
                    min={10}
                    step={10}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant={showPaths ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowPaths(!showPaths)}
                  >
                    {showPaths ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                    Paths
                  </Button>
                  <Button
                    variant={showConfidence ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowConfidence(!showConfidence)}
                  >
                    {showConfidence ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                    Confidence
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chart Display */}
      <Card>
        <CardHeader>
          <CardTitle>
            {chartType === 'paths' ? 'Portfolio Value Simulation Paths' : 'Final Value Distribution'}
          </CardTitle>
          <CardDescription>
            {chartType === 'paths' 
              ? `Showing ${Math.min(sampleSize[0], 20)} simulation paths out of ${results.paths.length} total simulations`
              : `Distribution of final portfolio values across ${results.finalValues.length} simulations`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'paths' ? (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="day" 
                    tickFormatter={formatDay}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    tickFormatter={formatValue}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <Tooltip
                    formatter={(value: number) => [formatValue(value), '']}
                    labelFormatter={(day: number) => `Day ${day}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  
                  {/* Initial value reference line */}
                  <ReferenceLine 
                    y={results.initialValue} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    label="Initial Value"
                  />

                  {/* Confidence intervals */}
                  {showConfidence && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="p95"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        strokeOpacity={0.8}
                        name="95th Percentile"
                      />
                      <Line
                        type="monotone"
                        dataKey="p75"
                        stroke="hsl(var(--primary))"
                        strokeWidth={1}
                        dot={false}
                        strokeOpacity={0.6}
                        name="75th Percentile"
                      />
                      <Line
                        type="monotone"
                        dataKey="p50"
                        stroke="hsl(var(--accent))"
                        strokeWidth={2}
                        dot={false}
                        name="Median"
                      />
                      <Line
                        type="monotone"
                        dataKey="p25"
                        stroke="hsl(var(--primary))"
                        strokeWidth={1}
                        dot={false}
                        strokeOpacity={0.6}
                        name="25th Percentile"
                      />
                      <Line
                        type="monotone"
                        dataKey="p5"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={false}
                        strokeOpacity={0.8}
                        name="5th Percentile"
                      />
                    </>
                  )}

                  {/* Individual simulation paths */}
                  {showPaths && Array.from({ length: Math.min(20, sampleSize[0]) }).map((_, index) => (
                    <Line
                      key={index}
                      type="monotone"
                      dataKey={`path${index}`}
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={0.5}
                      dot={false}
                      strokeOpacity={0.3}
                    />
                  ))}
                </LineChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="value" 
                    tickFormatter={formatValue}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Probability']}
                    labelFormatter={(value: number) => `Value: ${formatValue(value)}`}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  
                  <ReferenceLine 
                    x={results.initialValue} 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    label="Initial Value"
                  />

                  <Line
                    type="monotone"
                    dataKey="probability"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    fill="hsl(var(--primary) / 0.1)"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};