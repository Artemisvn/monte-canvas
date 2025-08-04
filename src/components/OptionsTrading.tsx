import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
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
  ScatterChart,
  Scatter,
  Surface,
  Cell
} from 'recharts';
import { 
  OptionsCalculator, 
  OptionsStrategyBuilder,
  OptionParameters,
  OptionStrategy,
  OptionLeg 
} from '@/lib/options';
import { 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  Layers,
  Target,
  Zap,
  Plus,
  Trash2,
  BarChart3
} from 'lucide-react';

export const OptionsTrading: React.FC = () => {
  const [optionParams, setOptionParams] = useState<OptionParameters>({
    spot: 100,
    strike: 100,
    timeToExpiry: 0.25, // 3 months
    riskFreeRate: 0.05,
    volatility: 0.2,
    dividendYield: 0
  });

  const [selectedStrategy, setSelectedStrategy] = useState<string>('long-call');
  const [customStrategy, setCustomStrategy] = useState<OptionStrategy>({
    id: 'custom',
    name: 'Custom Strategy',
    description: 'Build your own options strategy',
    legs: [],
    maxProfit: null,
    maxLoss: null,
    breakevens: [],
    type: 'neutral'
  });

  const [newLeg, setNewLeg] = useState({
    type: 'call' as 'call' | 'put',
    action: 'buy' as 'buy' | 'sell',
    strike: 100,
    quantity: 1
  });

  const [optionPrices, setOptionPrices] = useState({ call: 0, put: 0 });
  const [greeks, setGreeks] = useState({
    call: { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 },
    put: { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 }
  });

  const [volSurface, setVolSurface] = useState<any[]>([]);
  const [payoffData, setPayoffData] = useState<any[]>([]);

  // Calculate option prices and Greeks whenever parameters change
  useEffect(() => {
    const prices = OptionsCalculator.blackScholes(optionParams);
    setOptionPrices(prices);

    const callGreeks = OptionsCalculator.calculateGreeks(optionParams, 'call');
    const putGreeks = OptionsCalculator.calculateGreeks(optionParams, 'put');
    setGreeks({ call: callGreeks, put: putGreeks });

    // Generate volatility surface
    const strikes = Array.from({ length: 21 }, (_, i) => optionParams.spot * (0.7 + i * 0.03));
    const expiries = [0.08, 0.16, 0.25, 0.5, 1.0]; // 1 month to 1 year
    const surface = OptionsCalculator.generateVolatilitySurface(
      optionParams.spot,
      optionParams.riskFreeRate,
      strikes,
      expiries
    );
    setVolSurface(surface);

    // Generate payoff diagram for custom strategy
    if (customStrategy.legs.length > 0) {
      const spotRange = Array.from({ length: 101 }, (_, i) => optionParams.spot * (0.5 + i * 0.01));
      const payoffs = OptionsStrategyBuilder.calculatePayoff(customStrategy, spotRange);
      setPayoffData(payoffs);
    }
  }, [optionParams, customStrategy]);

  const addLegToStrategy = () => {
    const legParams = { ...optionParams, strike: newLeg.strike };
    const legPrices = OptionsCalculator.blackScholes(legParams);
    const premium = newLeg.type === 'call' ? legPrices.call : legPrices.put;

    const leg: OptionLeg = {
      ...newLeg,
      premium
    };

    setCustomStrategy(prev => ({
      ...prev,
      legs: [...prev.legs, leg]
    }));
  };

  const removeLeg = (index: number) => {
    setCustomStrategy(prev => ({
      ...prev,
      legs: prev.legs.filter((_, i) => i !== index)
    }));
  };

  const formatCurrency = (value: number) => `$${value.toFixed(2)}`;
  const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;
  const formatGreek = (value: number, decimals: number = 4) => value.toFixed(decimals);

  const getStrategyGreeks = () => {
    if (customStrategy.legs.length === 0) return null;
    return OptionsStrategyBuilder.calculateStrategyGreeks(customStrategy, optionParams);
  };

  const strategyGreeks = getStrategyGreeks();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Options Trading Suite
          </CardTitle>
          <CardDescription>
            Advanced options pricing, Greeks analysis, and strategy building
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pricing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pricing">Options Pricing</TabsTrigger>
          <TabsTrigger value="greeks">Greeks Analysis</TabsTrigger>
          <TabsTrigger value="strategies">Strategy Builder</TabsTrigger>
          <TabsTrigger value="volatility">Volatility Surface</TabsTrigger>
          <TabsTrigger value="payoff">Payoff Diagrams</TabsTrigger>
        </TabsList>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Parameters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Option Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Spot Price</Label>
                  <Input
                    type="number"
                    value={optionParams.spot}
                    onChange={(e) => setOptionParams(prev => ({ ...prev, spot: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Strike Price</Label>
                  <Input
                    type="number"
                    value={optionParams.strike}
                    onChange={(e) => setOptionParams(prev => ({ ...prev, strike: parseFloat(e.target.value) || 0 }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time to Expiry (Years)</Label>
                  <div className="px-2">
                    <Slider
                      value={[optionParams.timeToExpiry]}
                      onValueChange={([value]) => setOptionParams(prev => ({ ...prev, timeToExpiry: value }))}
                      min={0.01}
                      max={2}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground mt-1">
                      {(optionParams.timeToExpiry * 365).toFixed(0)} days
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Volatility (%)</Label>
                  <div className="px-2">
                    <Slider
                      value={[optionParams.volatility * 100]}
                      onValueChange={([value]) => setOptionParams(prev => ({ ...prev, volatility: value / 100 }))}
                      min={1}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground mt-1">
                      {formatPercent(optionParams.volatility)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Risk-Free Rate (%)</Label>
                  <div className="px-2">
                    <Slider
                      value={[optionParams.riskFreeRate * 100]}
                      onValueChange={([value]) => setOptionParams(prev => ({ ...prev, riskFreeRate: value / 100 }))}
                      min={0}
                      max={10}
                      step={0.1}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-muted-foreground mt-1">
                      {formatPercent(optionParams.riskFreeRate)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Call Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <TrendingUp className="h-4 w-4" />
                  Call Option
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-success">
                    {formatCurrency(optionPrices.call)}
                  </div>
                  <div className="text-sm text-muted-foreground">Option Premium</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delta</span>
                    <Badge variant="outline">{formatGreek(greeks.call.delta)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gamma</span>
                    <Badge variant="outline">{formatGreek(greeks.call.gamma)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Theta</span>
                    <Badge variant="outline">{formatGreek(greeks.call.theta)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vega</span>
                    <Badge variant="outline">{formatGreek(greeks.call.vega)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rho</span>
                    <Badge variant="outline">{formatGreek(greeks.call.rho)}</Badge>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-muted-foreground">
                    Moneyness: {((optionParams.spot / optionParams.strike - 1) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Intrinsic: {formatCurrency(Math.max(optionParams.spot - optionParams.strike, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Time Value: {formatCurrency(optionPrices.call - Math.max(optionParams.spot - optionParams.strike, 0))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Put Option */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <TrendingDown className="h-4 w-4" />
                  Put Option
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-destructive">
                    {formatCurrency(optionPrices.put)}
                  </div>
                  <div className="text-sm text-muted-foreground">Option Premium</div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Delta</span>
                    <Badge variant="outline">{formatGreek(greeks.put.delta)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gamma</span>
                    <Badge variant="outline">{formatGreek(greeks.put.gamma)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Theta</span>
                    <Badge variant="outline">{formatGreek(greeks.put.theta)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vega</span>
                    <Badge variant="outline">{formatGreek(greeks.put.vega)}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Rho</span>
                    <Badge variant="outline">{formatGreek(greeks.put.rho)}</Badge>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-xs text-muted-foreground">
                    Moneyness: {((optionParams.strike / optionParams.spot - 1) * 100).toFixed(1)}%
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Intrinsic: {formatCurrency(Math.max(optionParams.strike - optionParams.spot, 0))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Time Value: {formatCurrency(optionPrices.put - Math.max(optionParams.strike - optionParams.spot, 0))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="greeks" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Greeks Sensitivity Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={Array.from({ length: 51 }, (_, i) => {
                      const spot = optionParams.spot * (0.7 + i * 0.012);
                      const params = { ...optionParams, spot };
                      const callGreeks = OptionsCalculator.calculateGreeks(params, 'call');
                      return {
                        spot,
                        delta: callGreeks.delta,
                        gamma: callGreeks.gamma * 10, // Scale for visibility
                        theta: callGreeks.theta * 100 // Scale for visibility
                      };
                    })}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="spot" 
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={formatCurrency}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          formatGreek(name === 'delta' ? value : name === 'gamma' ? value / 10 : value / 100),
                          name === 'delta' ? 'Delta' : name === 'gamma' ? 'Gamma (×10)' : 'Theta (×100)'
                        ]}
                        labelFormatter={(spot: number) => `Spot: ${formatCurrency(spot)}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="delta" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={false}
                        name="delta"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="gamma" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        dot={false}
                        name="gamma"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="theta" 
                        stroke="hsl(var(--warning))" 
                        strokeWidth={2}
                        dot={false}
                        name="theta"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Greeks Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-3">Call Option Greeks</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-success">{formatGreek(greeks.call.delta)}</div>
                        <div className="text-sm text-muted-foreground">Delta</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{formatGreek(greeks.call.gamma)}</div>
                        <div className="text-sm text-muted-foreground">Gamma</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-destructive">{formatGreek(greeks.call.theta)}</div>
                        <div className="text-sm text-muted-foreground">Theta</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-primary">{formatGreek(greeks.call.vega)}</div>
                        <div className="text-sm text-muted-foreground">Vega</div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Put Option Greeks</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-destructive">{formatGreek(greeks.put.delta)}</div>
                        <div className="text-sm text-muted-foreground">Delta</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold">{formatGreek(greeks.put.gamma)}</div>
                        <div className="text-sm text-muted-foreground">Gamma</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-destructive">{formatGreek(greeks.put.theta)}</div>
                        <div className="text-sm text-muted-foreground">Theta</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-lg font-bold text-primary">{formatGreek(greeks.put.vega)}</div>
                        <div className="text-sm text-muted-foreground">Vega</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="strategies" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategy Builder */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-4 w-4" />
                  Strategy Builder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Select value={newLeg.type} onValueChange={(value: 'call' | 'put') => 
                    setNewLeg(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="put">Put</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={newLeg.action} onValueChange={(value: 'buy' | 'sell') => 
                    setNewLeg(prev => ({ ...prev, action: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-sm">Strike</Label>
                    <Input
                      type="number"
                      value={newLeg.strike}
                      onChange={(e) => setNewLeg(prev => ({ ...prev, strike: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Quantity</Label>
                    <Input
                      type="number"
                      value={newLeg.quantity}
                      onChange={(e) => setNewLeg(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>

                <Button onClick={addLegToStrategy} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Leg
                </Button>

                {/* Strategy Legs */}
                <div className="space-y-2">
                  <Label>Strategy Legs ({customStrategy.legs.length})</Label>
                  {customStrategy.legs.map((leg, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="text-sm">
                        <Badge variant={leg.action === 'buy' ? 'default' : 'destructive'} className="mr-2">
                          {leg.action.toUpperCase()}
                        </Badge>
                        <Badge variant={leg.type === 'call' ? 'secondary' : 'outline'} className="mr-2">
                          {leg.type.toUpperCase()}
                        </Badge>
                        Strike: {formatCurrency(leg.strike)} | Qty: {leg.quantity}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLeg(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>

                {/* Strategy Greeks */}
                {strategyGreeks && (
                  <div className="border-t pt-4">
                    <Label className="text-sm font-medium">Strategy Greeks</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-sm font-bold">{formatGreek(strategyGreeks.delta)}</div>
                        <div className="text-xs text-muted-foreground">Delta</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-sm font-bold">{formatGreek(strategyGreeks.gamma)}</div>
                        <div className="text-xs text-muted-foreground">Gamma</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-sm font-bold">{formatGreek(strategyGreeks.theta)}</div>
                        <div className="text-xs text-muted-foreground">Theta</div>
                      </div>
                      <div className="text-center p-2 bg-muted/50 rounded">
                        <div className="text-sm font-bold">{formatGreek(strategyGreeks.vega)}</div>
                        <div className="text-xs text-muted-foreground">Vega</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Predefined Strategies */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Predefined Strategies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {OptionsStrategyBuilder.getStrategies().map(strategy => (
                    <div 
                      key={strategy.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                        selectedStrategy === strategy.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedStrategy(strategy.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{strategy.name}</h4>
                          <p className="text-sm text-muted-foreground">{strategy.description}</p>
                        </div>
                        <Badge 
                          variant={
                            strategy.type === 'bullish' ? 'default' :
                            strategy.type === 'bearish' ? 'destructive' :
                            strategy.type === 'volatile' ? 'secondary' : 'outline'
                          }
                        >
                          {strategy.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="volatility" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Implied Volatility Surface
              </CardTitle>
              <CardDescription>
                3D visualization of implied volatility across strikes and expiries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={volSurface}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="strike" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Strike Price', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis 
                      dataKey="expiry" 
                      stroke="hsl(var(--muted-foreground))"
                      label={{ value: 'Time to Expiry (Years)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === 'impliedVol' ? formatPercent(value) : value.toFixed(2),
                        name === 'impliedVol' ? 'Implied Vol' : name
                      ]}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Scatter 
                      dataKey="impliedVol" 
                      fill="hsl(var(--primary))"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payoff" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Strategy Payoff Diagram
              </CardTitle>
              <CardDescription>
                Profit/Loss visualization at expiration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {payoffData.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={payoffData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="spot" 
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={formatCurrency}
                        label={{ value: 'Stock Price at Expiration', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={formatCurrency}
                        label={{ value: 'Profit/Loss', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'P&L']}
                        labelFormatter={(spot: number) => `Stock Price: ${formatCurrency(spot)}`}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="payoff"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary) / 0.2)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Add strategy legs to see payoff diagram</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};