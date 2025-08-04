import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  TechnicalAnalysis, 
  CandlestickData as TACandle,
} from '@/lib/technicalAnalysis';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Layers,
  Maximize2,
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts';

interface ChartConfig {
  symbol: string;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';
  indicators: string[];
  chartType: 'candlestick' | 'line' | 'area';
}

export const AdvancedChart: React.FC = () => {
  const [config, setConfig] = useState<ChartConfig>({
    symbol: 'AAPL',
    timeframe: '1d',
    indicators: ['SMA-20', 'Volume'],
    chartType: 'line'
  });

  const [marketData, setMarketData] = useState<TACandle[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeIndicators, setActiveIndicators] = useState<{ [key: string]: boolean }>({
    'SMA-20': true,
    'SMA-50': false,
    'EMA-12': false,
    'RSI': false,
    'MACD': false,
    'Bollinger': false,
    'Volume': true,
    'VWAP': false,
    'Stochastic': false,
    'ATR': false
  });

  // Available technical indicators
  const availableIndicators = [
    { id: 'SMA-20', name: 'SMA (20)', type: 'overlay', color: '#2196F3' },
    { id: 'SMA-50', name: 'SMA (50)', type: 'overlay', color: '#FF9800' },
    { id: 'EMA-12', name: 'EMA (12)', type: 'overlay', color: '#4CAF50' },
    { id: 'EMA-26', name: 'EMA (26)', type: 'overlay', color: '#9C27B0' },
    { id: 'Bollinger', name: 'Bollinger Bands', type: 'overlay', color: '#E91E63' },
    { id: 'VWAP', name: 'VWAP', type: 'overlay', color: '#795548' },
    { id: 'RSI', name: 'RSI (14)', type: 'oscillator', color: '#FF5722' },
    { id: 'MACD', name: 'MACD', type: 'oscillator', color: '#3F51B5' },
    { id: 'Stochastic', name: 'Stochastic', type: 'oscillator', color: '#009688' },
    { id: 'ATR', name: 'ATR (14)', type: 'oscillator', color: '#607D8B' },
    { id: 'Volume', name: 'Volume', type: 'volume', color: '#FFC107' }
  ];

  // Generate and load market data
  useEffect(() => {
    const data = TechnicalAnalysis.generateSampleData(config.symbol, 100);
    setMarketData(data);
  }, [config.symbol]);

  const toggleIndicator = (indicatorId: string) => {
    setActiveIndicators(prev => ({
      ...prev,
      [indicatorId]: !prev[indicatorId]
    }));
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;
  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const currentPrice = marketData.length > 0 ? marketData[marketData.length - 1] : null;
  const priceChange = currentPrice && marketData.length > 1 
    ? currentPrice.close - marketData[marketData.length - 2].close 
    : 0;
  const priceChangePercent = currentPrice && marketData.length > 1 
    ? (priceChange / marketData[marketData.length - 2].close) * 100 
    : 0;

  // Prepare chart data with indicators
  const prepareChartData = () => {
    if (marketData.length === 0) return [];

    const chartData: any[] = marketData.map((candle, index) => ({
      date: candle.time,
      price: candle.close,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      volume: candle.volume,
      index
    }));

    // Add technical indicators
    if (activeIndicators['SMA-20']) {
      const sma20 = TechnicalAnalysis.sma(marketData, 20);
      sma20.forEach((point, i) => {
        const chartIndex = chartData.findIndex(d => d.date === point.time);
        if (chartIndex !== -1) {
          chartData[chartIndex].sma20 = point.value;
        }
      });
    }

    if (activeIndicators['SMA-50']) {
      const sma50 = TechnicalAnalysis.sma(marketData, 50);
      sma50.forEach((point, i) => {
        const chartIndex = chartData.findIndex(d => d.date === point.time);
        if (chartIndex !== -1) {
          chartData[chartIndex].sma50 = point.value;
        }
      });
    }

    if (activeIndicators['EMA-12']) {
      const ema12 = TechnicalAnalysis.ema(marketData, 12);
      ema12.forEach((point, i) => {
        const chartIndex = chartData.findIndex(d => d.date === point.time);
        if (chartIndex !== -1) {
          chartData[chartIndex].ema12 = point.value;
        }
      });
    }

    if (activeIndicators['VWAP']) {
      const vwap = TechnicalAnalysis.vwap(marketData);
      vwap.forEach((point, i) => {
        const chartIndex = chartData.findIndex(d => d.date === point.time);
        if (chartIndex !== -1) {
          chartData[chartIndex].vwap = point.value;
        }
      });
    }

    if (activeIndicators['Bollinger']) {
      const bb = TechnicalAnalysis.bollingerBands(marketData, 20, 2);
      bb.upper.forEach((point, i) => {
        const chartIndex = chartData.findIndex(d => d.date === point.time);
        if (chartIndex !== -1) {
          chartData[chartIndex].bbUpper = point.value;
          chartData[chartIndex].bbLower = bb.lower[i]?.value;
          chartData[chartIndex].bbMiddle = bb.middle[i]?.value;
        }
      });
    }

    return chartData;
  };

  const prepareOscillatorData = () => {
    if (marketData.length === 0) return [];

    const data: any[] = [];

    if (activeIndicators['RSI']) {
      const rsi = TechnicalAnalysis.rsi(marketData, 14);
      rsi.forEach(point => {
        data.push({
          date: point.time,
          rsi: point.value,
          type: 'RSI'
        });
      });
    }

    if (activeIndicators['MACD']) {
      const macd = TechnicalAnalysis.macd(marketData, 12, 26, 9);
      macd.macdLine.forEach((point, i) => {
        const existingPoint = data.find(d => d.date === point.time);
        if (existingPoint) {
          existingPoint.macd = point.value;
          existingPoint.signal = macd.signalLine[i]?.value;
          existingPoint.histogram = macd.histogram[i]?.value;
        } else {
          data.push({
            date: point.time,
            macd: point.value,
            signal: macd.signalLine[i]?.value,
            histogram: macd.histogram[i]?.value,
            type: 'MACD'
          });
        }
      });
    }

    return data;
  };

  const chartData = prepareChartData();
  const oscillatorData = prepareOscillatorData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Advanced Charts
              </CardTitle>
              <CardDescription>
                Professional-grade charting with technical analysis
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              {currentPrice && (
                <div className="text-right">
                  <div className="text-2xl font-bold">{formatPrice(currentPrice.close)}</div>
                  <div className={`text-sm ${priceChange >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {priceChange >= 0 ? '+' : ''}{formatPrice(priceChange)} ({priceChangePercent >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%)
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Chart Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Symbol</Label>
                <Select value={config.symbol} onValueChange={(value) => 
                  setConfig(prev => ({ ...prev, symbol: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AAPL">Apple (AAPL)</SelectItem>
                    <SelectItem value="GOOGL">Google (GOOGL)</SelectItem>
                    <SelectItem value="MSFT">Microsoft (MSFT)</SelectItem>
                    <SelectItem value="TSLA">Tesla (TSLA)</SelectItem>
                    <SelectItem value="NVDA">NVIDIA (NVDA)</SelectItem>
                    <SelectItem value="AMZN">Amazon (AMZN)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Timeframe</Label>
                <Select value={config.timeframe} onValueChange={(value: any) => 
                  setConfig(prev => ({ ...prev, timeframe: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1m">1 Minute</SelectItem>
                    <SelectItem value="5m">5 Minutes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="1d">1 Day</SelectItem>
                    <SelectItem value="1w">1 Week</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Chart Type</Label>
                <Select value={config.chartType} onValueChange={(value: any) => 
                  setConfig(prev => ({ ...prev, chartType: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="candlestick">Candlestick</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="fullscreen"
                  checked={isFullscreen}
                  onCheckedChange={setIsFullscreen}
                />
                <Label htmlFor="fullscreen">Fullscreen</Label>
              </div>
            </CardContent>
          </Card>

          {/* Technical Indicators */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Technical Indicators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableIndicators.filter(ind => ind.type === 'overlay').map(indicator => (
                  <div key={indicator.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: indicator.color }}
                      />
                      <Label className="text-sm">{indicator.name}</Label>
                    </div>
                    <Switch
                      checked={activeIndicators[indicator.id] || false}
                      onCheckedChange={() => toggleIndicator(indicator.id)}
                    />
                  </div>
                ))}
                
                <div className="border-t pt-3 mt-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Oscillators</Label>
                  {availableIndicators.filter(ind => ind.type === 'oscillator').map(indicator => (
                    <div key={indicator.id} className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: indicator.color }}
                        />
                        <Label className="text-sm">{indicator.name}</Label>
                      </div>
                      <Switch
                        checked={activeIndicators[indicator.id] || false}
                        onCheckedChange={() => toggleIndicator(indicator.id)}
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 mt-3">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase">Volume</Label>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded"
                        style={{ backgroundColor: '#FFC107' }}
                      />
                      <Label className="text-sm">Volume</Label>
                    </div>
                    <Switch
                      checked={activeIndicators['Volume'] || false}
                      onCheckedChange={() => toggleIndicator('Volume')}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Stats */}
          {currentPrice && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Market Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Open</span>
                  <span className="text-sm font-medium">{formatPrice(currentPrice.open)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">High</span>
                  <span className="text-sm font-medium">{formatPrice(currentPrice.high)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Low</span>
                  <span className="text-sm font-medium">{formatPrice(currentPrice.low)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Volume</span>
                  <span className="text-sm font-medium">{formatVolume(currentPrice.volume)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Chart */}
        <div className="lg:col-span-3">
          <div className={`space-y-4 ${isFullscreen ? 'fixed inset-4 z-50 bg-background p-6 overflow-auto' : ''}`}>
            {/* Price Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {config.symbol} - {config.timeframe} Price Chart
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {config.chartType === 'line' ? (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={formatPrice}
                          domain={['dataMin', 'dataMax']}
                        />
                        <Tooltip
                          formatter={(value: number, name: string) => [formatPrice(value), name]}
                          labelFormatter={(date: string) => new Date(date).toLocaleDateString()}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        
                        <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Price" />
                        
                        {activeIndicators['SMA-20'] && (
                          <Line type="monotone" dataKey="sma20" stroke="#2196F3" strokeWidth={2} dot={false} name="SMA 20" />
                        )}
                        {activeIndicators['SMA-50'] && (
                          <Line type="monotone" dataKey="sma50" stroke="#FF9800" strokeWidth={2} dot={false} name="SMA 50" />
                        )}
                        {activeIndicators['EMA-12'] && (
                          <Line type="monotone" dataKey="ema12" stroke="#4CAF50" strokeWidth={2} dot={false} name="EMA 12" />
                        )}
                        {activeIndicators['VWAP'] && (
                          <Line type="monotone" dataKey="vwap" stroke="#795548" strokeWidth={2} dot={false} name="VWAP" />
                        )}
                        {activeIndicators['Bollinger'] && (
                          <>
                            <Line type="monotone" dataKey="bbUpper" stroke="#E91E63" strokeWidth={1} dot={false} name="BB Upper" />
                            <Line type="monotone" dataKey="bbLower" stroke="#E91E63" strokeWidth={1} dot={false} name="BB Lower" />
                            <Line type="monotone" dataKey="bbMiddle" stroke="#E91E63" strokeWidth={1} strokeDasharray="5 5" dot={false} name="BB Middle" />
                          </>
                        )}
                      </LineChart>
                    ) : config.chartType === 'area' ? (
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={formatPrice}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatPrice(value), 'Price']}
                          labelFormatter={(date: string) => new Date(date).toLocaleDateString()}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Area type="monotone" dataKey="price" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.2)" strokeWidth={2} />
                      </AreaChart>
                    ) : (
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={formatPrice}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Line type="monotone" dataKey="high" stroke="#26a69a" strokeWidth={1} dot={false} name="High" />
                        <Line type="monotone" dataKey="low" stroke="#ef5350" strokeWidth={1} dot={false} name="Low" />
                        <Line type="monotone" dataKey="close" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Close" />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Volume Chart */}
            {activeIndicators['Volume'] && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={formatVolume}
                        />
                        <Tooltip
                          formatter={(value: number) => [formatVolume(value), 'Volume']}
                          labelFormatter={(date: string) => new Date(date).toLocaleDateString()}
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        <Bar dataKey="volume" fill="#FFC107" opacity={0.7} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Oscillators */}
            {(activeIndicators['RSI'] || activeIndicators['MACD']) && oscillatorData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Technical Oscillators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={oscillatorData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                          tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        />
                        <YAxis 
                          stroke="hsl(var(--muted-foreground))"
                          fontSize={12}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '6px'
                          }}
                        />
                        
                        {activeIndicators['RSI'] && (
                          <Line type="monotone" dataKey="rsi" stroke="#FF5722" strokeWidth={2} dot={false} name="RSI" />
                        )}
                        {activeIndicators['MACD'] && (
                          <>
                            <Line type="monotone" dataKey="macd" stroke="#3F51B5" strokeWidth={2} dot={false} name="MACD" />
                            <Line type="monotone" dataKey="signal" stroke="#FF9800" strokeWidth={2} dot={false} name="Signal" />
                            <Bar dataKey="histogram" fill="#2196F3" opacity={0.5} name="Histogram" />
                          </>
                        )}
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};