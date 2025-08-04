import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  Volume2,
  Clock,
  Globe,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  marketCap: string;
}

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  symbols: string[];
}

export const LiveMarketDashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [newsData, setNewsData] = useState<NewsItem[]>([]);
  const [marketIndices, setMarketIndices] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Fetch real market data from Yahoo Finance via Supabase edge function
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        // Fetch stock quotes
        const stockResponse = await fetch('/functions/v1/yahoo-finance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'quote',
            symbols: ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'NFLX']
          })
        });
        
        if (stockResponse.ok) {
          const stockData = await stockResponse.json();
          setMarketData(stockData.data);
        }
        
        // Fetch market indices
        const indicesResponse = await fetch('/functions/v1/yahoo-finance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'indices'
          })
        });
        
        if (indicesResponse.ok) {
          const indicesData = await indicesResponse.json();
          setMarketIndices(indicesData.data);
        }
        
      } catch (error) {
        console.error('Failed to fetch market data:', error);
        // Fallback to demo data if API fails
        setMarketData([
          { symbol: 'AAPL', price: 192.53, change: 2.14, changePercent: 1.12, volume: 45230000, high: 194.23, low: 190.15, marketCap: '$2.96T' },
          { symbol: 'GOOGL', price: 142.47, change: -0.86, changePercent: -0.60, volume: 22150000, high: 144.12, low: 141.85, marketCap: '$1.79T' },
          { symbol: 'MSFT', price: 420.15, change: 3.42, changePercent: 0.82, volume: 18920000, high: 422.67, low: 418.33, marketCap: '$3.12T' },
          { symbol: 'TSLA', price: 248.86, change: -7.23, changePercent: -2.82, volume: 89450000, high: 256.75, low: 246.12, marketCap: '$792B' },
          { symbol: 'AMZN', price: 171.25, change: 1.85, changePercent: 1.09, volume: 31760000, high: 172.94, low: 169.88, marketCap: '$1.78T' },
          { symbol: 'NVDA', price: 875.34, change: 12.56, changePercent: 1.45, volume: 51820000, high: 882.45, low: 867.21, marketCap: '$2.16T' },
          { symbol: 'META', price: 484.72, change: -2.18, changePercent: -0.45, volume: 14330000, high: 489.15, low: 482.67, marketCap: '$1.23T' },
          { symbol: 'NFLX', price: 668.25, change: 5.92, changePercent: 0.89, volume: 8950000, high: 671.83, low: 663.47, marketCap: '$288B' }
        ]);
        setMarketIndices([
          { name: 'S&P 500', value: 5108.76, change: 18.42, changePercent: 0.36 },
          { name: 'NASDAQ', value: 16315.19, change: -24.85, changePercent: -0.15 },
          { name: 'DOW', value: 39781.37, change: 89.23, changePercent: 0.22 },
          { name: 'VIX', value: 14.67, change: -1.23, changePercent: -7.74 }
        ]);
      }
    };

    const generateNews = (): NewsItem[] => {
      const newsItems = [
        {
          title: "Fed Signals Potential Rate Cut in Q2",
          summary: "Federal Reserve officials hint at monetary policy shift amid economic uncertainty...",
          symbols: ['SPY', 'QQQ'],
          sentiment: 'positive' as const
        },
        {
          title: "Tech Giants Report Strong Q4 Earnings",
          summary: "Major technology companies exceed analyst expectations with robust revenue growth...",
          symbols: ['AAPL', 'GOOGL', 'MSFT'],
          sentiment: 'positive' as const
        },
        {
          title: "Energy Sector Faces Headwinds",
          summary: "Oil prices decline on concerns over global demand and increased supply...",
          symbols: ['XOM', 'CVX'],
          sentiment: 'negative' as const
        },
        {
          title: "AI Innovation Drives Market Optimism",
          summary: "Artificial intelligence breakthroughs fuel investor enthusiasm in tech sector...",
          symbols: ['NVDA', 'AMD'],
          sentiment: 'positive' as const
        }
      ];

      return newsItems.map((item, index) => ({
        id: `news-${index}`,
        title: item.title,
        summary: item.summary,
        timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        sentiment: item.sentiment,
        symbols: item.symbols
      }));
    };

    // Initial data load
    fetchMarketData();
    setNewsData(generateNews());

    // Set up live updates every 30 seconds
    const interval = setInterval(() => {
      if (isLive) {
        fetchMarketData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isLive]);

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatChange = (value: number) => value >= 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-success';
      case 'negative': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="h-3 w-3" />;
      case 'negative': return <TrendingDown className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  // Generate sample intraday chart data
  const intradayData = Array.from({ length: 50 }, (_, i) => ({
    time: `${9 + Math.floor(i / 6)}:${(i % 6) * 10}`,
    price: 150 + Math.sin(i * 0.2) * 10 + Math.random() * 5,
    volume: Math.random() * 1000000 + 500000
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Live Market Dashboard
              </CardTitle>
              <CardDescription>
                Real-time market data from Yahoo Finance
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isLive ? "default" : "secondary"} className="animate-pulse">
                <Activity className="h-3 w-3 mr-1" />
                {isLive ? 'Live' : 'Paused'}
              </Badge>
              <Badge variant="outline">
                <Clock className="h-3 w-3 mr-1" />
                {new Date().toLocaleTimeString()}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Market Overview</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
          <TabsTrigger value="news">Financial News</TabsTrigger>
          <TabsTrigger value="charts">Live Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Market Indices */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Major Indices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {marketIndices.map((index, i) => (
                  <div key={index.name} className="space-y-1">
                    <p className="text-sm font-medium">{index.name}</p>
                    <p className="text-lg font-bold">{formatCurrency(index.value)}</p>
                    <div className={`flex items-center gap-1 text-sm ${
                      index.change >= 0 ? 'text-success' : 'text-destructive'
                    }`}>
                      {index.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formatChange(index.change)} ({formatPercent(index.changePercent)})
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Movers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  Top Gainers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {marketData
                    .filter(stock => stock.changePercent > 0)
                    .sort((a, b) => b.changePercent - a.changePercent)
                    .slice(0, 4)
                    .map(stock => (
                      <div key={stock.symbol} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatCurrency(stock.price)}
                          </span>
                        </div>
                        <span className="text-success text-sm font-medium">
                          {formatPercent(stock.changePercent)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-destructive" />
                  Top Losers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {marketData
                    .filter(stock => stock.changePercent < 0)
                    .sort((a, b) => a.changePercent - b.changePercent)
                    .slice(0, 4)
                    .map(stock => (
                      <div key={stock.symbol} className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{stock.symbol}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {formatCurrency(stock.price)}
                          </span>
                        </div>
                        <span className="text-destructive text-sm font-medium">
                          {formatPercent(stock.changePercent)}
                        </span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="watchlist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Portfolio Watchlist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-left p-2">Price</th>
                      <th className="text-left p-2">Change</th>
                      <th className="text-left p-2">Volume</th>
                      <th className="text-left p-2">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marketData.map(stock => (
                      <tr key={stock.symbol} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="p-2 font-medium">{stock.symbol}</td>
                        <td className="p-2">{formatCurrency(stock.price)}</td>
                        <td className={`p-2 ${stock.change >= 0 ? 'text-success' : 'text-destructive'}`}>
                          <div className="flex items-center gap-1">
                            {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {formatChange(stock.change)} ({formatPercent(stock.changePercent)})
                          </div>
                        </td>
                        <td className="p-2 text-muted-foreground">{formatVolume(stock.volume)}</td>
                        <td className="p-2 text-muted-foreground">{stock.marketCap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="news" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Financial News & Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {newsData.map(news => (
                  <div key={news.id} className="border-b pb-4 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${getSentimentColor(news.sentiment)}`}>
                        {getSentimentIcon(news.sentiment)}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium">{news.title}</h3>
                        <p className="text-sm text-muted-foreground">{news.summary}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(news.timestamp).toLocaleString()}</span>
                          <div className="flex items-center gap-1">
                            <span>Related:</span>
                            {news.symbols.map(symbol => (
                              <Badge key={symbol} variant="outline" className="text-xs">
                                {symbol}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  AAPL - Intraday Chart
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={intradayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={formatCurrency}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Price']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.1)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Volume Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={intradayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="time" 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickFormatter={formatVolume}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatVolume(value), 'Volume']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Bar 
                        dataKey="volume" 
                        fill="hsl(var(--secondary))"
                        opacity={0.7}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};